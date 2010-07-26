class BugCommentsController < ApplicationController
  before_filter :per_load

  def new
    render_ui do |ui|
      ui.fbox :show,:title=>"回复",:partial=>"comments/form_comment",:locals=>{:markable=>@bug}
    end
  end

  include CommentCreateMethods
  def create
    comment = _create_comment_for(@bug)
    render_ui do |ui|
      if comment.creator.is_admin?
        ui.mplist :insert,[@bug,"admin",comment],:partial=>"/bug_comments/info_admin_bug_comment",:locals=>{:comment=>comment},:prev=>"TOP"
      end
      _rjs_insert_info_comment(ui,comment)
      _rjs_form_reset(ui)
      ui.page.close_box
    end
  end

  def newest
    @last_comments = @bug.comments.by_created_at(:desc).limited(10)
    @markable = @bug
    render :layout=>false,:template=>"comments/newest"
  end

  def destroy
    @remark_comment.destroy
    render_ui do |ui|
      ui.mplist :remove, @remark_comment
    end
  end

  def per_load
    @bug = Bug.find(params[:bug_id]) if params[:bug_id]
  end
end
