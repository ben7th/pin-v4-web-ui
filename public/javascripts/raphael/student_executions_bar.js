function show_execution_hbarchart(dom_id,all_count,executed_count,completed_count){
  var paper = Raphael(dom_id,200,54)
  paper.text(40, 10, "　总共"+all_count).attr({"font-size": 12});
  paper.text(40, 28, "已执行"+executed_count).attr({"font-size": 12});
  paper.text(40, 46, "已确认"+completed_count).attr({"font-size": 12});
  paper.g.hbarchart(70, 0, 130, 19, [all_count],{to:12,colors:['#D1ECFF']})
  paper.g.hbarchart(70, 18, 130, 19, [executed_count],{to:12,colors:['#EAFF99']})
  paper.g.hbarchart(70, 36, 130, 19, [completed_count],{to:12,colors:['#FFB596']})
}