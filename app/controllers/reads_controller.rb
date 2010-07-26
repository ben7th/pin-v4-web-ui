class ReadsController < ApplicationController

  def index
    if session[:next_readable_id].blank? || session[:next_readable_type].blank?
      _next_one_session
    end
    @readable = session[:next_readable_type].find_by_id(session[:next_readable_id])
    if @readable
      Reading.find_or_create_by_user_id_and_readable_id_and_readable_type(current_user.id,@readable.id,@readable.class.to_s)
    end
  end

  def next_one
    _next_one_session
    redirect_to :action => "index"
  end

  def _next_one_session
    readable = Reading.get_random_readable(current_user)
    session[:next_readable_type],session[:next_readable_id] = readable.type, readable.id
  end

  def unlike
    @unlike_feelings = current_user.feelings.for_feelable_type(Entry).feel("bad")
  end

  def find
  end
  
end
