class AddHandledAndClosedToBugs < ActiveRecord::Migration
  def self.up
    add_column :bugs,:handled,:boolean,:default=>false
    add_column :bugs,:closed,:boolean,:default=>false
  end

  def self.down
    remove_column(:bugs,:handled)
    remove_column(:bugs,:closed)
  end
  
end
