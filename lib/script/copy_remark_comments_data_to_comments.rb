class CopyRemarkCommentsDataToComments
  ActiveRecord::Base.transaction do
    remark_comments = Remark.find(:all,:conditions=>{:type=>"Remark::Comment"})

    total_count = remark_comments.count
    p "remark_comments 总数量 #{total_count} 个"

    remark_comments.each_with_index do |rc,index|
      p "完成度（#{index+1}/#{total_count}）"

      # markable 是已经不存在的模型
      begin
        rc.markable
      rescue Exception => ex
        next
      end

      # markable 已被删除
      next if rc.markable.blank?
      
      Comment.create!(
        :creator=>rc.creator,:markable=>rc.markable,
        :content=>rc.content,:reply_to=>rc.reply_to)
    end
  end
end