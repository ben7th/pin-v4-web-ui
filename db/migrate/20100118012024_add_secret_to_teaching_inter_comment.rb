class AddSecretToTeachingInterComment < ActiveRecord::Migration
  def self.up
    add_column :teaching_inter_comments,:secret,:boolean,:default=>false
  end

  def self.down
    remove_column(:teaching_inter_comments, :secret)
  end
end
