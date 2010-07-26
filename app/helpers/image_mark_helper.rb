module ImageMarkHelper
  def image_mark_style(image_mark)
    left = "#{image_mark.left}px"
    top = "#{image_mark.top}px"
    width = "#{image_mark.width}px"
    height = "#{image_mark.height}px"
    "left:#{left};top:#{top};width:#{width};height:#{height};"
  end
end
