class WorkBoardQuoting < ActiveRecord::Base
  belongs_to :entry
  belongs_to :work_board
end
