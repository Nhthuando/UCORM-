import { useEffect, useState } from 'react';
import {
  Store,
  LayoutDashboard,
  MapPin,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  Star,
  Sparkles,
  MessageSquare,
  Plus,
} from 'lucide-react';
import ReviewDetailModal from './ReviewDetailModal';
import AddPlaceModal from './AddPlaceModal';
import {
  ApiError,
  fetchReviews,
  getPlaceReviews,
  getPlaces,
  type ApiPlace,
  type ApiReview,
  type StoredUser,
} from '../api/client';

type Review = {
  id: string;
  placeId: string;
  author: string;
  rating: number;
  text: string;
  status: 'pending' | 'resolved';
  date: string;
  place: string;
};

interface DashboardPageProps {
  user: StoredUser | null;
  onLogout: () => void;
}

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [places, setPlaces] = useState<ApiPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userInitial = (user?.name || user?.email || 'U').trim().charAt(0).toUpperCase();

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const placesResponse = await getPlaces();
      const placeList = placesResponse.place || [];
      setPlaces(placeList);

      const allReviews = await Promise.all(
        placeList.map((place) => loadReviewsForPlace(place))
      );

      setReviews(allReviews.flat());
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onLogout();
        return;
      }

      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Không thể tải dữ liệu, vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviewsForPlace = async (place: ApiPlace) => {
    try {
      const response = await getPlaceReviews(place.id);
      return response.reviews.map((review) => mapReview(review, place));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const response = await fetchReviews(place.id);
        return response.savedReviews.map((review) => mapReview(review, place));
      }
      throw error;
    }
  };

  const mapReview = (review: ApiReview, place: ApiPlace): Review => {
    const rawDate = review.published_at || review.created_at;
    const date = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : '';
    const status = review.status?.toLowerCase() === 'resolved' ? 'resolved' : 'pending';

    return {
      id: review.id,
      placeId: review.place_id,
      author: review.author_name || 'Ẩn danh',
      rating: review.rating ?? 0,
      text: review.text || '',
      status,
      date,
      place: place.name || 'Địa điểm',
    };
  };

  const filteredReviews =
    filterStatus === 'all' ? reviews : reviews.filter((r) => r.status === filterStatus);

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    resolved: reviews.filter((r) => r.status === 'resolved').length,
    places: places.length,
  };

  const handleReviewStatusChange = (reviewId: string, newStatus: 'pending' | 'resolved') => {
    setReviews(reviews.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r)));
  };

  const handlePlaceAdded = async () => {
    await loadDashboardData();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 p-2 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-xl text-gray-900">UCOrm</span>}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium">
            <LayoutDashboard className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button
            onClick={() => setShowAddPlace(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            <MapPin className="w-5 h-5" />
            {sidebarOpen && <span>Places</span>}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Tìm kiếm đánh giá..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-900 rounded-full flex items-center justify-center text-white font-semibold">
                  {userInitial}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoading && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Đang tải dữ liệu...
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Tổng đánh giá</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Chờ xử lý</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <Sparkles className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Đã xử lý</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.resolved}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <Star className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Địa điểm</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.places}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Đánh giá</h2>
                <button
                  onClick={() => setShowAddPlace(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Thêm địa điểm
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tất cả ({stats.total})
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'pending'
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Chờ xử lý ({stats.pending})
                </button>
                <button
                  onClick={() => setFilterStatus('resolved')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'resolved'
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Đã xử lý ({stats.resolved})
                </button>
              </div>
            </div>

            {/* Reviews Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tác giả
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Địa điểm
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Nội dung
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {review.author?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.author}</p>
                            <p className="text-sm text-gray-500">{review.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{review.place}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (review.rating || 0)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-sm text-gray-700 truncate">{review.text}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            review.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {review.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="px-3 py-1.5 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors font-medium flex items-center gap-1"
                          >
                            <Sparkles className="w-4 h-4" />
                            AI Reply
                          </button>
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReviews.length === 0 && (
              <div className="py-16 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đánh giá</h3>
                <p className="text-gray-600">Thêm địa điểm để bắt đầu quản lý đánh giá</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onStatusChange={handleReviewStatusChange}
          onAuthError={onLogout}
        />
      )}
      {showAddPlace && (
        <AddPlaceModal
          onClose={() => setShowAddPlace(false)}
          onPlaceAdded={handlePlaceAdded}
          onAuthError={onLogout}
        />
      )}
    </div>
  );
}
