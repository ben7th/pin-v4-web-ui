class CreateSubscriptionEntries < ActiveRecord::Migration
  def self.up
    create_table :subscription_entries do |t|
      t.integer :user_id
      t.integer :rss_feed_id
      t.timestamps
    end
    add_index(:subscription_entries, :user_id)
    add_index(:subscription_entries, :rss_feed_id)
  end

  def self.down
    drop_table :subscription_entries
  end
end
