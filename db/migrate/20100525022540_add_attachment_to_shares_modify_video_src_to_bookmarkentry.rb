class AddAttachmentToSharesModifyVideoSrcToBookmarkentry < ActiveRecord::Migration
  def self.up
    add_column :shares,:entry_id,:integer
    change_column :bookmark_entries,:video_src,:string
  end

  def self.down
    remove_column(:shares, :entry_id)
    change_column :bookmark_entries,:video_src,:text
  end
  
end
