module SurveysHelper

  def published_str(survey)
    survey.published? ? '<b class="loud">已发布</b>' : '未发布'
  end

  def num2letter(num)
    (num % 26 + 65).chr
  end

  # 找到摸个问题的反馈答案，根据 survey_result 和 question
  # 反馈答案是个数组,
  def find_answer(survey_result,question)

    # 找出这个问题的回答 question_answer
    # 正常情况这个数组长度肯定是 1
    question_answers = (survey_result.question_answers.select{|answer| answer.question == question} || [nil])
    question_answer = question_answers[0]

    # 把这个问题的反馈放进数组中
    answers_str_arr = question_answer.answer_selections.collect do |answer_selection|
      option = answer_selection.question_option
      if option.kind == "DESC"
        answer_selection.content
      else
        option.title
      end
    end
    return answers_str_arr
  end
end
