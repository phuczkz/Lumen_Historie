import React, { useState } from 'react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // --- TODO: Replace with actual API call to send email/save message ---
    console.log('Submitting contact form:', formData);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    // Simulate success/error (replace with actual API response handling)
    const success = Math.random() > 0.2; // Simulate 80% success rate
    // --- End TODO ---

    if (success) {
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
    } else {
      setSubmitStatus('error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 via-teal-50 to-cyan-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Liên hệ với chúng tôi</h1>
          <p className="mt-4 text-lg text-gray-600">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy gửi câu hỏi hoặc yêu cầu của bạn qua form bên dưới.</p>
        </div>
      </section>

      {/* Main Content: Contact Info & Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Column 1: Contact Info & Map */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thông tin liên hệ</h2>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-green-600 mr-3 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>
                    <strong>Hồ Chí Minh:</strong> Tầng 7, Toà nhà Bộ Năm, số 35 Hoàng Diệu, Phường 13, Quận 4
                  </span>
                </p>
                <p className="flex items-center">
                  <svg className="flex-shrink-0 h-6 w-6 text-green-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <a href="tel:0866135885" className="hover:text-green-700">0866.13.5885</a>
                </p>
                 <p className="flex items-center">
                  <svg className="flex-shrink-0 h-6 w-6 text-green-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a href="mailto:info@lumenhistoire.vn" className="hover:text-green-700">info@lumenhistoire.vn</a> { /* Assuming email */} 
                </p>
              </div>
            </div>
            
            {/* Map Section - Replaced placeholder with Google Maps embed */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Vị trí văn phòng</h3>
               {/* Google Maps Embed */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                 <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125418.43201833801!2d106.6170029456719!3d10.77930434253924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529292e8d3dd1%3A0xf15f5aad773c112b!2sHo%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1678886543210!5m2!1sen!2s" // Example Embed URL (Replace with your specific location if needed)
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps Location"
                 ></iframe>
              </div>
            </div>
          </div>

          {/* Column 2: Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gửi tin nhắn cho chúng tôi</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
                <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Tin nhắn</label>
                <textarea name="message" id="message" rows={4} required value={formData.message} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"></textarea>
              </div>
              
              {/* Submit Status Messages */}
               {submitStatus === 'success' && (
                 <div className="p-4 bg-green-100 text-green-700 rounded-md text-sm">
                   Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
                 </div>
               )}
               {submitStatus === 'error' && (
                 <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">
                   Đã có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.
                 </div>
               )}

              <div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium
                    ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-200 hover:bg-green-300 focus:outline-none'}
                    transition duration-150 ease-in-out`}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 