class AddReasonToReports < ActiveRecord::Migration
  def self.up
    add_column :reports, :reason, :string
  end

  def self.down
    remove_column(:reports, :reason)
  end
end
