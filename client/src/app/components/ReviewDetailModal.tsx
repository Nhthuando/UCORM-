import { useState } from 'react';
import { X, Star, Check, Loader2 } from 'lucide-react';

type Review = {
  id: number;
  author: string;
  rating: number;
  text: string;
  status: 'pending' | 'resolved';
  date: string;
  place: string;
};

type AIReplyOption = {
  id: string;
  title: string;
  tone: string;
  content: string;
};

interface ReviewDetailModalProps {
  review: Review;
  onClose: () => void;
  onStatusChange: (reviewId: number, newStatus: 'pending' | 'resolved') => void;
}

const generateAIReplies = (review: Review): AIReplyOption[] => {
  const isPositive = review.rating >= 4;
  const isNegative = review.rating <= 2;

  if (isPositive) {
    return [
      {
        id: 'professional',
        title: 'Chuyên nghiệp',
        tone: 'Standard',
        content: `Xin chân thành cảm ơn quý khách ${review.author} đã dành thời gian đánh giá và chia sẻ trải nghiệm tích cực tại ${review.place}. Chúng tôi rất vui khi biết rằng quý khách hài lòng với dịch vụ của chúng tôi. Hy vọng sẽ được phục vụ quý khách trong những lần tới.`,
      },
      {
        id: 'friendly',
        title: 'Thân thiện',
        tone: 'Friendly',
        content: `Cảm ơn bạn ${review.author} rất nhiều! Đội ngũ chúng mình siêu vui khi được phục vụ bạn. Những lời khen của bạn là động lực lớn để chúng mình tiếp tục cải thiện dịch vụ mỗi ngày. Hẹn gặp lại bạn sớm nhé! 😊`,
      },
      {
        id: 'gratitude',
        title: 'Tri ân',
        tone: 'Grateful',
        content: `${review.place} xin gửi lời cảm ơn chân thành nhất đến quý khách ${review.author}. Sự hài lòng của quý khách là niềm vinh dự và động lực to lớn cho toàn bộ đội ngũ của chúng tôi. Chúng tôi cam kết sẽ không ngừng nâng cao chất lượng dịch vụ để mang đến những trải nghiệm tuyệt vời nhất cho quý khách.`,
      },
    ];
  } else if (isNegative) {
    return [
      {
        id: 'professional',
        title: 'Chuyên nghiệp',
        tone: 'Standard',
        content: `Kính gửi quý khách ${review.author}, chúng tôi xin chân thành xin lỗi về trải nghiệm chưa được như mong đợi của quý khách. Ban quản lý ${review.place} đã ghi nhận phản hồi của quý khách và đang khẩn trương xem xét để cải thiện. Chúng tôi rất mong nhận được cơ hội để phục vụ quý khách tốt hơn trong tương lai.`,
      },
      {
        id: 'friendly',
        title: 'Thân thiện',
        tone: 'Friendly',
        content: `Chào ${review.author}, team mình thật sự rất xin lỗi vì những thiếu sót này! Mình đã ghi nhận và đang làm việc để khắc phục ngay. Mình rất mong được một cơ hội nữa để làm bạn hài lòng. Nếu bạn có thêm góp ý gì, đừng ngại liên hệ trực tiếp với mình nhé!`,
      },
      {
        id: 'fix',
        title: 'Khắc phục lỗi',
        tone: 'Fix',
        content: `Kính gửi ${review.author}, ${review.place} xin chân thành xin lỗi về sự bất tiện này. Chúng tôi đã xác định các vấn đề quý khách phản ánh và đã triển khai các biện pháp khắc phục cụ thể:\n\n• Tăng cường đào tạo nhân viên về chất lượng dịch vụ\n• Nâng cấp quy trình kiểm soát chất lượng\n• Cải thiện cơ sở vật chất\n\nChúng tôi rất mong được đón tiếp quý khách trở lại để chứng minh sự cải thiện của chúng tôi.`,
      },
    ];
  } else {
    return [
      {
        id: 'professional',
        title: 'Chuyên nghiệp',
        tone: 'Standard',
        content: `Xin cảm ơn quý khách ${review.author} đã dành thời gian đánh giá. Chúng tôi trân trọng mọi ý kiến đóng góp từ quý khách. ${review.place} sẽ tiếp tục nỗ lực để mang đến trải nghiệm tốt hơn trong những lần tới.`,
      },
      {
        id: 'friendly',
        title: 'Thân thiện',
        tone: 'Friendly',
        content: `Cảm ơn ${review.author} đã chia sẻ! Team mình rất trân trọng mọi phản hồi và sẽ cố gắng cải thiện để mang đến trải nghiệm tuyệt vời hơn cho bạn trong lần sau. Hy vọng sẽ được gặp lại bạn!`,
      },
      {
        id: 'improve',
        title: 'Cải thiện',
        tone: 'Improvement',
        content: `Kính gửi ${review.author}, cảm ơn quý khách đã góp ý. ${review.place} cam kết sẽ xem xét kỹ lưỡng các điểm cần cải thiện mà quý khách đề cập để nâng cao chất lượng dịch vụ. Sự hài lòng của quý khách là ưu tiên hàng đầu của chúng tôi.`,
      },
    ];
  }
};

export default function ReviewDetailModal({
  review,
  onClose,
  onStatusChange,
}: ReviewDetailModalProps) {
  const [selectedReply, setSelectedReply] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReplies, setAIReplies] = useState<AIReplyOption[]>([]);

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setAIReplies(generateAIReplies(review));
      setIsGenerating(false);
    }, 1500);
  };

  const handleApprove = (replyId: string) => {
    setSelectedReply(replyId);
    setTimeout(() => {
      onStatusChange(review.id, 'resolved');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết đánh giá</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Review Content */}
        <div className="p-6 border-b border-gray-200 overflow-y-auto">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {review.author[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{review.author}</h3>
                  <p className="text-sm text-gray-500">
                    {review.place} • {review.date}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    review.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {review.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                </span>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">{review.text}</p>
            </div>
          </div>
        </div>

        {/* AI Replies Section */}
        <div className="p-6 flex-1 overflow-y-auto">
          {aiReplies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tạo phản hồi bằng AI
              </h3>
              <p className="text-gray-600 mb-6">
                AI sẽ tạo 3 phiên bản phản hồi với giọng điệu khác nhau
              </p>
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5" />
                    Tạo phản hồi AI
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Chọn phản hồi phù hợp:</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {aiReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                      selectedReply === reply.id
                        ? 'border-blue-700 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedReply(reply.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{reply.title}</h4>
                        <p className="text-xs text-gray-500">{reply.tone}</p>
                      </div>
                      {selectedReply === reply.id && (
                        <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {reply.content}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(reply.id);
                      }}
                      className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                    >
                      Chấp nhận
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
