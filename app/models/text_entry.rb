# == Schema Information
# Schema version: 20091223090135
#
# Table name: text_entries
#
#  id         :integer(4)      not null, primary key
#  content    :text            default(""), not null
#  title      :string(255)     
#  created_at :datetime        
#  updated_at :datetime        
#

class TextEntry < ActiveRecord::Base
  validates_presence_of :content

  before_save :content_sanitize_clean
  def content_sanitize_clean
    self.content = self.content.sanitize_clean
    return true
  end
  
  before_save :set_length
  def set_length
    self.length = self.content.split(//u).length
    return true
  end


  # 返回这个文本资源的段落数，按照空行分
  def part_count
    self.parts.count
  end

  # 返回这个文本资源的所有段落，按照空行分
  def parts
    f = /(\r?\n[\s　]*\r?\n)/
    # temp_arr= ['\n\n','haha adsf','\n   \n','hia hai']
    temp_arr = self.content.split(f).select { |str| str != ""}
    # temp_arr= ['\n\nhaha adsf','\n   \n','hia hai']
    temp_arr = self.process_first_element(temp_arr,f)
    parts = []
    temp_arr.each_with_index {|str,i| i.odd? ? next : parts << str + temp_arr[i+1].to_s }
    parts
  end

  # temp_arr= ['\n\n','haha adsf','\n   \n','hia hai']
  # result ['\n\nhaha adsf','\n   \n','hia hai']
  def process_first_element(temp_arr,f)
    if temp_arr[0] =~ f
      temp_arr[0] = temp_arr[0] + temp_arr[1]
      temp_arr.delete_at(1)
    end
    temp_arr
  end

  # 返回第 index 个段落，按照空行分
  def part_of(index)
    self.parts[index-1]
  end
  
  # 返回这个文本资源的段落数，按照回车换行分
  def paragraph_count
    self.paragraphs.count
  end

  # 返回这个文本资源的所有段落，按照回车换行分
  def paragraphs
    self.content.split("\n").str_compact.collect do |str|
      str.gsub(/\r/,"")
    end
  end

  # 返回第 index 个段落，按照回车换行分
  def paragraph_of(index)
    self.paragraphs[index-1]
  end

  # 将文本文件按照段落号码进行拆分
  # 传入的段落数单独分成一段，前面的组成一部分，后面的组成一部分
  # 段落数是1或者最后一段，情况特殊，只是分成本身和剩余的两部分
  def part_split(number)
    unless number > 0 && number <= self.part_count
      raise "输入的段落号不存在"
    end
    texts = []
    case number
    when 1 then texts = part_split_by_first_part
    when self.part_count then texts = part_split_by_last_part
    else texts = part_split_by_middle_part(number)
    end
    return chang_to_text_entry(texts)
  end

  # 按照第一段分
  def part_split_by_first_part
    texts = []
    texts << self.parts.to(0)*""
    texts << self.parts.from(1)*""
    return texts.flatten
  end

  # 按照末段分
  def part_split_by_last_part
    texts = []
    texts << self.parts.to(self.part_count-2)*""
    texts << self.parts.from(self.part_count-1)*""
    return texts.flatten
  end

  # 按照中间某段分
  def part_split_by_middle_part(number)
    texts = []
    texts << self.parts.to(number-2)*""
    texts << self.part_of(number)
    texts << self.parts.from(number)*""
    return texts
  end

  # 将得到的段落数组转变成文本资源数组
  def chang_to_text_entry(texts)
    text_entries = []
    texts.each_with_index do |text,i|
      text_entry = TextEntry.create!(:title=>"#{self.title}_#{i+1}",:content=>text,:user=>self.user)
      text_entries << text_entry
    end
    return text_entries
  end

  def self.search(keyword,user)
    TextEntry.find(:all,:conditions=>[' content like ? ',"%#{keyword}%"]).map{|text_entry|text_entry.entry if text_entry.entry&&text_entry.entry.user == user&&text_entry.entry.deleted_at.blank?}.compact
  end

  include Entry::ResourceMethods
end
