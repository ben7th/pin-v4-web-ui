class RepositoryInfo
  attr_reader :author,:date,:email,:name
  def initialize(info)
    @author = info[:author] || info["author"]
    @email = info[:email] || info["email"]
    @date = info[:date] || info["date"]
    @name = info[:name] || info["name"]
    @attributes = {:author=>@author,:email=>email,:date=>@date,:name=>@name}
  end

  def to_xml(options = {})
    @attributes.to_xml({:root => self.class.name.downcase}.merge(options))
  end

  def id
    "#{@name}_#{@author}".hash
  end
end