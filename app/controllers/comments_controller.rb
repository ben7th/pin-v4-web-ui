class CommentsController < ApplicationController
  
  before_filter :pre_load

  include CommentCreateMethods
  def create
    comment = _create_comment_for(@markable)
    render_ui do |ui|
      _rjs_insert_info_comment(ui,comment)
      _rjs_form_reset(ui)
    end
  end

  def destroy
    @comment.destroy
    render_ui do |ui|
      ui.mplist :remove, @comment
    end
  end

  def newest
    @last_comments = @markable.comments.by_created_at(:desc).limited(10)
    render :layout=>false
  end
  
  def pre_load
    @markable = Entry.find(params[:entry_id]) if params[:entry_id]
    @markable = RssFeed.find(params[:rss_feed_id]) if params[:rss_feed_id]
    @markable = RssItem.find(params[:rss_item_id]) if params[:rss_item_id]
    @markable = Bug.find(params[:bug_id]) if params[:bug_id]
    @markable = Announcement.find(params[:announcement_id]) if params[:announcement_id]
    @comment = Comment.find(params[:id]) if params[:id]
  end
  
end