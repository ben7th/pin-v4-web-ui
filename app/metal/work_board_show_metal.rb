class WorkBoardShowMetal < BaseMetal
  def self.routes
    {:method=>'GET',:regexp=>/^\/users\/(.+)\/work_board.xml/}
  end

  def self.deal(hash)
    url_match = hash[:url_match]
    user_id = url_match[1]
    wb = WorkBoard.find_or_create_by_user_id(user_id)
    result = wb.entries.map do |entry|
      entry.id
    end*","
    return [200, {"Content-Type" => "text/xml"}, [result]]
  end

end