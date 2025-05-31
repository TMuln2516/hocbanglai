import React, { useState, useEffect } from "react";
import { data } from "../../data/Data";

interface Question {
  number: number;
  text: string;
  options: string[];
  correct_answer: string;
  is_critical: boolean;
  has_image: boolean;
  image_path?: string;
}

interface ExamSet {
  id: string;
  questions: Question[];
}

const LOCAL_STORAGE_KEY = "exam_history";

const HomePage: React.FC = () => {
  const [exam, setExam] = useState<ExamSet | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"question" | "questionList">(
    "question"
  );

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.exam && parsed.answers && parsed.currentPage) {
        setExam(parsed.exam);
        setAnswers(parsed.answers);
        setCurrentPage(parsed.currentPage);
        setActiveTab("question");
      }
    }
  }, []);

  useEffect(() => {
    if (!exam) return;
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ exam, answers, currentPage })
    );
  }, [exam, answers, currentPage]);

  const handleStartExam = () => {
    const allQuestions = data.chapters
      .flatMap((chapter) => chapter.questions)
      .filter((q) => typeof q.correct_answer === "string")
      .sort((a, b) => a.number - b.number);

    setExam({ id: "full-exam", questions: allQuestions });
    setAnswers({});
    setCurrentPage(1);
    setActiveTab("question");
  };

  const handleAnswerChange = (questionNumber: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: answer }));
  };

  const goToNextQuestion = () => {
    if (exam && currentPage < exam.questions.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSelectQuestion = (index: number) => {
    setCurrentPage(index + 1);
    setActiveTab("question");
  };

  const handleReset = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setExam(null);
    setAnswers({});
    setCurrentPage(1);
    setActiveTab("question");
  };

  const renderQuestion = () => {
    if (!exam || exam.questions.length === 0) return null;

    const question = exam.questions[currentPage - 1];
    const selectedAnswer = answers[question.number];

    return (
      <>
        <div className="max-w-3xl mx-auto mb-4 flex justify-center">
          <button
            onClick={handleReset}
            className="bg-red-500 text-white font-semibold py-2 px-6 rounded hover:bg-red-600"
          >
            Làm lại từ đầu
          </button>
        </div>

        <div
          className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md mb-32 overflow-y-auto"
          style={{ maxHeight: "700px" }}
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-800">
            Câu {currentPage}: {question.text}
          </h2>

          {/* Hiển thị hình ảnh nếu có */}
          {question.has_image && question.number === 153 ? (
            <>
              <img
                src="/images/153_1.jpg"
                alt="Câu hỏi 153_1"
                className="my-2 max-w-full h-auto"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <img
                src="/images/153_2.jpg"
                alt="Câu hỏi 153_2"
                className="my-2 max-w-full h-auto"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </>
          ) : question.has_image ? (
            <img
              src={`${process.env.PUBLIC_URL}/images/${question.number}.jpg`}
              alt={`Câu hỏi ${question.number}`}
              className="my-2 max-w-full h-auto"
              onError={(e) => {
                console.warn(`Không tải được ảnh: ${question.number}.jpg`);
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}

          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <label
                key={idx}
                className={`block p-3 border rounded cursor-pointer transition
                  ${
                    selectedAnswer
                      ? option === question.correct_answer
                        ? "bg-green-100 border-green-500 font-bold"
                        : option === selectedAnswer
                        ? "bg-red-100 border-red-500"
                        : "bg-gray-100"
                      : "hover:bg-blue-100"
                  }`}
              >
                <input
                  type="radio"
                  name={`question-${question.number}`}
                  value={option}
                  className="mr-2"
                  checked={selectedAnswer === option}
                  onChange={() => handleAnswerChange(question.number, option)}
                  disabled={!!selectedAnswer}
                />
                <span className="mr-2 font-semibold">{idx + 1}.</span>
                {option}
              </label>
            ))}
          </div>

          {selectedAnswer && (
            <p className="mt-4 font-medium text-gray-800">
              Đáp án đúng:{" "}
              <span className="font-bold text-green-600">
                {question.correct_answer}
              </span>{" "}
              {selectedAnswer === question.correct_answer ? "✅" : "❌"}
            </p>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md py-4 px-8 flex justify-between items-center z-10">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentPage === 1}
            className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trang trước
          </button>
          <button
            onClick={goToNextQuestion}
            disabled={exam ? currentPage === exam.questions.length : true}
            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trang sau
          </button>
        </div>
      </>
    );
  };

  const renderQuestionList = () => {
    if (!exam) return null;

    return (
      <div className="max-w-3xl mx-auto mb-4 flex flex-wrap gap-3 justify-center">
        {exam.questions.map((q, idx) => {
          const userAnswer = answers[q.number];
          const isCurrent = currentPage === idx + 1;

          let buttonClass =
            "w-12 h-12 rounded-full border flex items-center justify-center font-semibold cursor-pointer transition-shadow duration-300 ";

          if (isCurrent) {
            buttonClass +=
              "bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-400/50";
          } else if (userAnswer) {
            if (userAnswer === q.correct_answer) {
              buttonClass +=
                "bg-green-200 text-green-900 border-green-400 shadow-inner";
            } else {
              buttonClass +=
                "bg-red-200 text-red-900 border-red-400 shadow-inner";
            }
          } else {
            buttonClass +=
              "bg-gray-100 text-gray-700 border-gray-300 shadow-sm";
          }

          return (
            <button
              key={q.number}
              onClick={() => handleSelectQuestion(idx)}
              className={`${buttonClass} hover:scale-110 hover:shadow-lg`}
              title={`Câu ${q.number}`}
            >
              {q.number}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {!exam ? (
        <div className="max-w-3xl mx-auto p-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
            Luyện thi bằng lái xe
          </h1>
          <button
            onClick={handleStartExam}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300"
          >
            Thi toàn bộ 250 câu hỏi
          </button>
        </div>
      ) : (
        <div className="max-w-3xl w-full">
          <div className="flex border-b border-gray-300 mb-4">
            <button
              className={`flex-1 py-3 text-center font-semibold ${
                activeTab === "question"
                  ? "border-b-4 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab("question")}
            >
              Câu hỏi
            </button>
            <button
              className={`flex-1 py-3 text-center font-semibold ${
                activeTab === "questionList"
                  ? "border-b-4 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab("questionList")}
            >
              Danh sách câu hỏi
            </button>
          </div>

          {activeTab === "question" ? renderQuestion() : renderQuestionList()}
        </div>
      )}
    </div>
  );
};

export default HomePage;
