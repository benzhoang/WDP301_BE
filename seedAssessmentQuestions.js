const mongoose = require('mongoose');
const AssessmentQuestion = require('./models/assessmentQuestionModel');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wdp301_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const assessmentQuestionsData = [
    {
        assessment_question_id: 1,
        question: "Trong suốt cuộc đời bạn, bạn đã từng sử dụng các chất nào sau đây? (Có thể chọn nhiều đáp án)",
        type: "multi-select",
        assessment_type: "ASSIST",
        multiSelect: true,
        allowMultiple: true,
        options: [
            {
                answer_id: 1,
                text: "Cần sa (marijuana, pot, cỏ, hash, v.v.)",
                score: 3,
                answer_order: 1
            },
            {
                answer_id: 2,
                text: "Cocaine (coke, crack, v.v.)",
                score: 3,
                answer_order: 2
            },
            {
                answer_id: 3,
                text: "Thuốc kích thích kê đơn (Adderall, Ritalin, thuốc ăn kiêng, v.v.) dùng sai mục đích",
                score: 3,
                answer_order: 3
            },
            {
                answer_id: 4,
                text: "Methamphetamine (meth, đá, ecstasy, molly, v.v.)",
                score: 3,
                answer_order: 4
            },
            {
                answer_id: 5,
                text: "Chất hít (keo, sơn, khí cười, poppers, v.v.)",
                score: 3,
                answer_order: 5
            },
            {
                answer_id: 6,
                text: "Thuốc phiện (heroin, morphine, codeine, v.v.)",
                score: 3,
                answer_order: 6
            },
            {
                answer_id: 7,
                text: "Thuốc an thần kê đơn (Valium, Serepax, Mogadon, v.v.) dùng sai mục đích",
                score: 3,
                answer_order: 7
            },
            {
                answer_id: 8,
                text: "Thuốc giảm đau kê đơn (morphine, methadone, codeine, v.v.) dùng sai mục đích",
                score: 3,
                answer_order: 8
            },
            {
                answer_id: 9,
                text: "Thuốc gây ảo giác (LSD, acid, mushrooms, v.v.)",
                score: 3,
                answer_order: 9
            },
            {
                answer_id: 10,
                text: "Rượu",
                score: 3,
                answer_order: 10
            },
            {
                answer_id: 11,
                text: "Tôi chưa từng sử dụng bất kỳ chất nào trong số này",
                score: 0,
                answer_order: 11
            }
        ]
    },
    {
        assessment_question_id: 2,
        question: "Trong 3 tháng qua, bạn đã sử dụng [chất] bao nhiêu lần?",
        type: "single-select",
        assessment_type: "ASSIST",
        options: [
            {
                answer_id: 12,
                text: "Chưa bao giờ",
                score: 0,
                answer_order: 1
            },
            {
                answer_id: 13,
                text: "1-2 lần",
                score: 2,
                answer_order: 2
            },
            {
                answer_id: 14,
                text: "3-5 lần",
                score: 3,
                answer_order: 3
            },
            {
                answer_id: 15,
                text: "6-9 lần",
                score: 4,
                answer_order: 4
            },
            {
                answer_id: 16,
                text: "10 lần trở lên",
                score: 6,
                answer_order: 5
            }
        ]
    },
    {
        assessment_question_id: 3,
        question: "Trong 3 tháng qua, bạn đã từng muốn hoặc cảm thấy cần phải sử dụng [chất]?",
        type: "single-select",
        assessment_type: "ASSIST",
        options: [
            {
                answer_id: 17,
                text: "Chưa bao giờ",
                score: 0,
                answer_order: 1
            },
            {
                answer_id: 18,
                text: "Có, nhưng không trong 3 tháng qua",
                score: 3,
                answer_order: 2
            },
            {
                answer_id: 19,
                text: "Có, trong 3 tháng qua",
                score: 4,
                answer_order: 3
            }
        ]
    },
    {
        assessment_question_id: 4,
        question: "Trong 3 tháng qua, bạn đã từng gặp vấn đề về sức khỏe, tài chính, gia đình hoặc xã hội do sử dụng [chất]?",
        type: "single-select",
        assessment_type: "ASSIST",
        options: [
            {
                answer_id: 20,
                text: "Chưa bao giờ",
                score: 0,
                answer_order: 1
            },
            {
                answer_id: 21,
                text: "Có, nhưng không trong 3 tháng qua",
                score: 4,
                answer_order: 2
            },
            {
                answer_id: 22,
                text: "Có, trong 3 tháng qua",
                score: 6,
                answer_order: 3
            }
        ]
    },
    {
        assessment_question_id: 5,
        question: "Bạn có từng thử giảm hoặc ngừng sử dụng [chất] nhưng không thành công?",
        type: "single-select",
        assessment_type: "ASSIST",
        options: [
            {
                answer_id: 23,
                text: "Chưa bao giờ",
                score: 0,
                answer_order: 1
            },
            {
                answer_id: 24,
                text: "Có, nhưng không trong 3 tháng qua",
                score: 3,
                answer_order: 2
            },
            {
                answer_id: 25,
                text: "Có, trong 3 tháng qua",
                score: 6,
                answer_order: 3
            }
        ]
    },
    {
        assessment_question_id: 6,
        question: "Bạn có từng sử dụng [chất] vào buổi sáng để bắt đầu ngày mới?",
        type: "single-select",
        assessment_type: "ASSIST",
        options: [
            {
                answer_id: 26,
                text: "Chưa bao giờ",
                score: 0,
                answer_order: 1
            },
            {
                answer_id: 27,
                text: "Có, nhưng không trong 3 tháng qua",
                score: 3,
                answer_order: 2
            },
            {
                answer_id: 28,
                text: "Có, trong 3 tháng qua",
                score: 5,
                answer_order: 3
            }
        ]
    },
    {
        assessment_question_id: 7,
        question: "Bạn có từng cảm thấy tội lỗi hoặc hối hận sau khi sử dụng [chất]?",
        type: "single-select",
        assessment_type: "ASSIST",
        options: [
            {
                answer_id: 29,
                text: "Chưa bao giờ",
                score: 0,
                answer_order: 1
            },
            {
                answer_id: 30,
                text: "Có, nhưng không trong 3 tháng qua",
                score: 3,
                answer_order: 2
            },
            {
                answer_id: 31,
                text: "Có, trong 3 tháng qua",
                score: 5,
                answer_order: 3
            }
        ]
    },
    {
        assessment_question_id: 8,
        question: "Bạn có từng quên làm những việc quan trọng vì sử dụng [chất]?",
        type: "single-select",
        assessment_type: "ASSIST",
        options: [
            {
                answer_id: 32,
                text: "Chưa bao giờ",
                score: 0,
                answer_order: 1
            },
            {
                answer_id: 33,
                text: "Có, nhưng không trong 3 tháng qua",
                score: 3,
                answer_order: 2
            },
            {
                answer_id: 34,
                text: "Có, trong 3 tháng qua",
                score: 5,
                answer_order: 3
            }
        ]
    }
];

async function seedAssessmentQuestions() {
    try {
        // Xóa dữ liệu cũ
        await AssessmentQuestion.deleteMany({});
        console.log('Đã xóa dữ liệu cũ');

        // Thêm dữ liệu mới
        const result = await AssessmentQuestion.insertMany(assessmentQuestionsData);
        console.log(`Đã thêm ${result.length} câu hỏi đánh giá`);

        // Đóng kết nối
        mongoose.connection.close();
        console.log('Đã đóng kết nối database');
    } catch (error) {
        console.error('Lỗi khi thêm dữ liệu:', error);
        mongoose.connection.close();
    }
}

// Chạy script
seedAssessmentQuestions(); 