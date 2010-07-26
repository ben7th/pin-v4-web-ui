class ModifyVersionToVerInIntroductions < ActiveRecord::Migration
  def self.up
    rename_column(:introductions, :version, :ver)
  end

  def self.down
    rename_column(:introductions, :ver, :version)
  end
end
