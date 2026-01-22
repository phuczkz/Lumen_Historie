import React, { useState } from 'react';

// Interface for FAQ items
interface FaqItemProps {
  question: string;
  answer: string;
}

// Accordion Item Component
const AccordionItem: React.FC<FaqItemProps & { isOpen: boolean; onClick: () => void }> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-200">
      <h2>
        <button 
          type="button" 
          className="flex justify-between items-center w-full py-5 px-5 text-left font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
          onClick={onClick}
          aria-expanded={isOpen}
        >
          <span>{question}</span>
          <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </h2>
      {isOpen && (
        <div className="py-5 px-5 text-sm text-gray-500 bg-gray-50">
          {answer}
        </div>
      )}
    </div>
  );
};

// Placeholder FAQ data
const faqData: FaqItemProps[] = [
  { question: 'Làm thế nào để đặt lịch hẹn với chuyên gia?', answer: 'Bạn có thể đặt lịch trực tuyến qua website của chúng tôi tại mục "Đặt lịch tư vấn" hoặc liên hệ trực tiếp qua hotline 0866.13.5885. Chúng tôi khuyến khích bạn đặt lịch trước để đảm bảo chuyên gia phù hợp có thể sắp xếp thời gian.' },
  { question: 'Chi phí cho một buổi tham vấn là bao nhiêu?', answer: 'Chi phí tham vấn có thể khác nhau tùy thuộc vào chuyên gia và hình thức tham vấn (cá nhân, cặp đôi, gia đình). Vui lòng tham khảo bảng giá chi tiết tại trang "Dịch vụ" hoặc liên hệ để được tư vấn cụ thể.' },
  { question: 'Thông tin của tôi có được bảo mật không?', answer: 'Chúng tôi cam kết bảo mật tuyệt đối mọi thông tin cá nhân và nội dung trao đổi của bạn theo đúng Nguyên tắc đạo đức nghề nghiệp và quy định pháp luật. Thông tin chỉ được tiết lộ trong trường hợp có sự đồng ý của bạn hoặc khi pháp luật yêu cầu (ví dụ: nguy cơ gây hại).' },
  { question: 'Một buổi tham vấn thường kéo dài bao lâu?', answer: 'Một buổi tham vấn cá nhân thông thường kéo dài 50-60 phút. Thời gian có thể điều chỉnh tùy thuộc vào nhu cầu và thỏa thuận giữa bạn và chuyên gia.' },
  { question: 'Tôi có thể hủy hoặc đổi lịch hẹn không?', answer: 'Bạn có thể hủy hoặc đổi lịch hẹn miễn phí nếu thông báo trước ít nhất 24 giờ. Vui lòng liên hệ bộ phận lễ tân để được hỗ trợ. Nếu hủy lịch trong vòng 24 giờ, bạn có thể sẽ phải chịu một khoản phí nhỏ.' },
];

const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white">
       {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-100 via-pink-50 to-red-50 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Câu hỏi thường gặp (FAQ)</h1>
          <p className="mt-4 text-xl text-gray-600">Giải đáp những thắc mắc phổ biến nhất về dịch vụ của chúng tôi.</p>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
           <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">Các câu hỏi phổ biến</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {faqData.map((faq, index) => (
              <AccordionItem 
                key={index} 
                question={faq.question} 
                answer={faq.answer} 
                isOpen={openIndex === index}
                onClick={() => handleToggle(index)}
              />
            ))}
          </div>
          <p className="mt-8 text-center text-gray-500">
            Bạn không tìm thấy câu trả lời? <a href="/lien-he" className="text-green-600 hover:underline">Liên hệ với chúng tôi</a> để được hỗ trợ trực tiếp.
          </p>
        </div>
      </section>
    </div>
  );
};

export default FaqPage; 