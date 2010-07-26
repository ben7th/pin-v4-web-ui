class AddHandledToReports < ActiveRecord::Migration
  def self.up
    add_column :reports,:handled,:boolean
  end

  def self.down
    remove_column(:reports, :handled)
  end
end
