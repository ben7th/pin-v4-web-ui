class Recycler

  def initialize(user)
    @user = user
  end
  
  # 将隐藏的某元素恢复
  module RecoverMethods
    def recover
      self.recover!
    end
  end

  module UserMethods
    def recycler
      return Recycler.new(self)
    end
  end
end
