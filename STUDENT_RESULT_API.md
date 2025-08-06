# API Kiểm Tra Kết Quả Học Tập

## Tổng quan
Các API này cho phép kiểm tra kết quả học tập của người học trong một program cụ thể.

## Endpoints

### 1. GET /api/quizzes/programs/:programId/student-result
Lấy tổng quan kết quả học tập của người học trong program.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "program": {
    "_id": "program_id",
    "name": "Tên khóa học",
    "description": "Mô tả khóa học"
  },
  "enrollment": {
    "enrolled_at": "2024-01-01T00:00:00.000Z",
    "status": "active",
    "completed_at": "2024-01-15T00:00:00.000Z",
    "is_completed": true
  },
  "progress": {
    "total_contents": 5,
    "completed_contents": 4,
    "progress_percentage": 80,
    "completed_content_ids": ["content_id_1", "content_id_2"]
  },
  "quiz_result": {
    "submission_id": "submission_id",
    "submitted_at": "2024-01-15T00:00:00.000Z",
    "score": 8,
    "total_questions": 10,
    "percentage": 80,
    "status": "graded",
    "feedback": "Làm bài tốt!"
  },
  "summary": {
    "can_take_quiz": true,
    "has_quiz": true,
    "has_submitted_quiz": true
  }
}
```

### 2. GET /api/quizzes/programs/:programId/student-result/detailed
Lấy chi tiết kết quả học tập bao gồm tiến độ từng content và chi tiết từng câu trả lời quiz.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "program": {
    "_id": "program_id",
    "name": "Tên khóa học",
    "description": "Mô tả khóa học",
    "quiz_id": "quiz_id"
  },
  "enrollment": {
    "enrolled_at": "2024-01-01T00:00:00.000Z",
    "status": "active",
    "completed_at": "2024-01-15T00:00:00.000Z",
    "is_completed": true
  },
  "content_progress": [
    {
      "content_id": "content_id_1",
      "title": "Bài học 1",
      "type": "video",
      "order": 1,
      "is_completed": true,
      "completed_at": "2024-01-02T00:00:00.000Z",
      "time_spent": 300
    }
  ],
  "quiz_result": {
    "submission_id": "submission_id",
    "submitted_at": "2024-01-15T00:00:00.000Z",
    "score": 8,
    "total_questions": 10,
    "percentage": 80,
    "status": "graded",
    "feedback": "Làm bài tốt!",
    "detailed_answers": [
      {
        "question_id": "question_id_1",
        "question_text": "Câu hỏi 1",
        "question_type": "single",
        "selected_options": ["option_id_1"],
        "written_answer": null,
        "is_correct": true,
        "correct_options": [
          {
            "_id": "option_id_1",
            "text": "Đáp án đúng"
          }
        ]
      }
    ]
  }
}
```

## Error Responses

### 404 - Chưa đăng ký khóa học
```json
{
  "success": false,
  "message": "Bạn chưa đăng ký khóa học này"
}
```

### 404 - Không tìm thấy khóa học
```json
{
  "success": false,
  "message": "Không tìm thấy khóa học"
}
```

### 500 - Lỗi server
```json
{
  "success": false,
  "message": "Lỗi server khi lấy kết quả học tập",
  "error": "Chi tiết lỗi"
}
```

## Sử dụng

### Frontend Integration
```javascript
// Lấy tổng quan kết quả
const getStudentResult = async (programId) => {
  const response = await fetch(`/api/quizzes/programs/${programId}/student-result`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Lấy chi tiết kết quả
const getDetailedResult = async (programId) => {
  const response = await fetch(`/api/quizzes/programs/${programId}/student-result/detailed`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## Tính năng

1. **Kiểm tra enrollment**: Đảm bảo user đã đăng ký program
2. **Tính toán tiến độ**: Tính % hoàn thành content
3. **Kết quả quiz**: Điểm số và % đúng
4. **Trạng thái hoàn thành**: Kiểm tra xem đã hoàn thành program chưa
5. **Chi tiết từng content**: Thông tin chi tiết về việc hoàn thành từng bài học
6. **Chi tiết từng câu trả lời**: Xem đáp án đã chọn và đáp án đúng

## Lưu ý

- API yêu cầu authentication
- Chỉ trả về kết quả của user đang đăng nhập
- Quiz result chỉ có khi program có quiz và user đã submit
- Progress percentage được tính dựa trên số content đã hoàn thành 