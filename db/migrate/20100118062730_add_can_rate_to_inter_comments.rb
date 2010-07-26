class AddCanRateToInterComments < ActiveRecord::Migration
  def self.up
    add_column :teaching_inter_comments,:can_rate,:boolean,:default=>false
  end

  def self.down
    remove_column(:teaching_inter_comments, :can_rate)
  end
end
