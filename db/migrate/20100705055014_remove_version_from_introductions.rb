class RemoveVersionFromIntroductions < ActiveRecord::Migration
  def self.up
    remove_column(:introductions, :ver)
  end

  def self.down
  end
end
