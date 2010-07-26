class AddAttachmentsLogoToApp < ActiveRecord::Migration
  def self.up
    add_column :apps, :logo_file_name, :string
    add_column :apps, :logo_content_type, :string
    add_column :apps, :logo_file_size, :integer
    add_column :apps, :logo_updated_at, :datetime
    add_column :apps, :developer, :string
    add_column :apps, :subject, :text
  end

  def self.down
    remove_column :apps, :logo_file_name
    remove_column :apps, :logo_content_type
    remove_column :apps, :logo_file_size
    remove_column :apps, :logo_updated_at
    remove_column :apps, :developer
    remove_column :apps, :subject
  end
end
