authorization do
  role :guest do
    # add permissions for guests here, e.g.
    #has_permission_on :conferences, :to => :read
  end

  role :admin do
    has_permission_on [:"index",:"announcements"], :to => :manage
    has_permission_on [:"teaching/eclasses",:user_roles], :to => :manage
    has_permission_on [:"users"], :to => [:manage,:batch_add]
  end

  # 涉及到命名空间的情况，
  # 例如 :"teaching/references" 对模型进行控制，:references是对controller进行控制
  role :teacher do
    has_permission_on [:tasks,:task_allocations,:requirements,
      :"teaching/lessons",:"teaching/procedures",:"teaching/assign_rules",
      :"teaching/scores",:"teaching/sections",
      :"teaching/inter_comments",:"teaching/inter_comment_allocations"], :to => :manage
  end

  role :student do
    has_permission_on [:tasks,:requirements,:"teaching/lessons",:"teaching/units",
      :"teaching/procedures",:"teaching/assigns"], :to => :read
  end

end

privileges do
  # default privilege hierarchies to facilitate RESTful Rails apps
  privilege :manage, :includes => [:create, :read, :update, :delete]
  privilege :read, :includes => [:index, :show]
  privilege :create, :includes => :new
  privilege :update, :includes => :edit
  privilege :delete, :includes => :destroy
  privilege :batch_add, :includes => [:view_batch_add,:action_batch_add,:view_batch_add_cs,:action_batch_add_cs]
end
