class RemoveTablesAboutSurvey < ActiveRecord::Migration
  def self.up
    drop_table :survey_results
    drop_table :surveys
    drop_table :question_answers
    drop_table :question_options
    drop_table :questions
    drop_table :answer_selections
  end

  def self.down
  end
end
