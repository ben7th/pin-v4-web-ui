class ChangeInvitationsFriendEmailToContactEmail < ActiveRecord::Migration
  def self.up
    rename_column :invitations, :friend_email, :contact_email
  end

  def self.down
  end
end
