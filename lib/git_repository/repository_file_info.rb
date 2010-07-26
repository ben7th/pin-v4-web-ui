class RepositoryFileInfo
  attr_reader :author,:date,:email,:name,:kind
  def initialize(info)
    @author = info[:author] || info["author"]
    @email = info[:email] || info["email"]
    @date = info[:date] || info["date"]
    @name = info[:name] || info["name"]
    @kind = info[:kind] || info["kind"]
    @attributes = {:author=>@author,:email=>email,:date=>@date,:name=>@name,:kind=>@kind}
  end

  def to_xml(options = {})
    @attributes.to_xml({:root => self.class.name.downcase}.merge(options))
  end
end
