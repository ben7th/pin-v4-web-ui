class WorkBoardRemoveMetal < BaseMetal
  def self.routes
    {:method=>'DELETE',:regexp=>/^\/users\/(.+)\/work_board\/remove/}
  end

  def self.deal(hash)
    url_match = hash[:url_match]
    user_id = url_match[1]
    env = hash[:env]
    params = Rack::Request.new(env).params
    entry_id = params[:entry_id] || params["entry_id"]
    wb = WorkBoard.find_by_user_id(user_id)
    if wb && wb.remove(entry_id)
      return [200, {"Content-Type" => "text/xml"}, ["add success"]]
    end
    return [500, {"Content-Type" => "text/xml"}, ["error"]]
  end

end