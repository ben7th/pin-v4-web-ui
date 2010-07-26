class DropTablesNotUsed < ActiveRecord::Migration
  def self.up
    drop_table :teaching_assign_rules
    drop_table :teaching_discussions
    drop_table :teaching_homeworks
    drop_table :teaching_inter_comment_allocations
    drop_table :teaching_inter_comments
    drop_table :teaching_lessons
    drop_table :teaching_procedures
    drop_table :teaching_scores
    drop_table :teaching_sections
    drop_table :attentions
    drop_table :folders
    drop_table :groups
    drop_table :link_entries
    drop_table :memberships
    drop_table :operations
    drop_table :rss_entries
    drop_table :todos
    drop_table :versions
  end

  def self.down
  end
end
