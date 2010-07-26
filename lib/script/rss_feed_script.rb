class RssFeedScript < ActiveRecord::Base

  def self.add_rss_feed_from_xml
    xml_content = Nokogiri::XML(xml = %`
      <?xml version="1.0" encoding="UTF-8"?>
      <opml version="1.0">
          <head>
              <title>Google 阅读器中 ? 的订阅</title>
          </head>
          <body>
              <outline title="休闲娱乐" text="休闲娱乐">
                  <outline text="2ch看日本" title="2ch看日本" type="rss"
                      xmlUrl="http://hi.baidu.com/letus2ch/rss" htmlUrl="http://hi.baidu.com/letus2ch"/>
                  <outline text="A.C.G空間" title="A.C.G空間" type="rss"
                      xmlUrl="http://feed.acgkj.com/" htmlUrl="http://www.acgkj.com/blog"/>
                  <outline text="Badblue" title="Badblue" type="rss"
                      xmlUrl="http://feeds.badblue.net/" htmlUrl="http://badblue.net"/>
                  <outline text="BZMUSIQUE" title="BZMUSIQUE" type="rss"
                      xmlUrl="http://feed.feedsky.com/bzmusique" htmlUrl="http://www.bzmusique.net"/>
                  <outline text="DigiArt" title="DigiArt" type="rss"
                      xmlUrl="http://feed.feedsky.com/digiart" htmlUrl="http://adfuns.com/index.php"/>
                  <outline text="Indie-G - 独立游戏中文网志"
                      title="Indie-G - 独立游戏中文网志" type="rss"
                      xmlUrl="http://www.indie-g.com/main/?q=rss.xml" htmlUrl="http://www.indie-g.com/wp"/>
                  <outline text="NTRPG" title="NTRPG" type="rss"
                      xmlUrl="http://feed.ntrpg.org/" htmlUrl="http://www.ntrpg.org/main"/>
                  <outline text="The Trow Times" title="The Trow Times"
                      type="rss"
                      xmlUrl="http://trow.cn/forum/index.php?act=rssout&amp;id=2" htmlUrl="http://trow.cn/forum/index.php"/>
                  <outline text="不着疯-严肃品牌与正经广告观察(推荐)"
                      title="不着疯-严肃品牌与正经广告观察(推荐)" type="rss"
                      xmlUrl="http://feed.feedsky.com/yansu" htmlUrl="http://hi.baidu.com/buzhaofeng"/>
                  <outline text="人皮纸の手卷" title="人皮纸の手卷" type="rss"
                      xmlUrl="http://rss.yculblog.com/dodonana.xml" htmlUrl="http://dodonana.ycool.com/"/>
                  <outline text="分享音乐的感动" title="分享音乐的感动" type="rss"
                      xmlUrl="http://www.m-instyle.cn/feed.asp" htmlUrl="http://www.m-instyle.cn/"/>
                  <outline text="和邪社" title="和邪社" type="rss"
                      xmlUrl="http://feed.feedsky.com/hexieweekly1" htmlUrl="http://www.hexieshe.com"/>
                  <outline text="夜刊少女" title="夜刊少女" type="rss"
                      xmlUrl="http://hcomicorz.blog101.fc2.com/?xml" htmlUrl="http://hcomicorz.blog101.fc2.com/"/>
                  <outline text="工口堂" title="工口堂" type="rss"
                      xmlUrl="http://www.moeu.net/feed.asp" htmlUrl="http://www.moeu.net/"/>
                  <outline text="异次元软件世界" title="异次元软件世界" type="rss"
                      xmlUrl="http://feed.iplaysoft.com/" htmlUrl="http://www.iplaysoft.com"/>
                  <outline text="影像日报 | Moviesoon.com 好莱坞电影手册"
                      title="影像日报 | Moviesoon.com 好莱坞电影手册" type="rss"
                      xmlUrl="http://mymovie.blogbus.com/index.rdf" htmlUrl="http://mymovie.blogbus.com"/>
                  <outline text="我们爱讲冷笑话" title="我们爱讲冷笑话" type="rss"
                      xmlUrl="http://feeds.feedburner.com/lengxiaohua" htmlUrl="http://lengxiaohua.net"/>
                  <outline text="技客乐趣" title="技客乐趣" type="rss"
                      xmlUrl="http://www.geeksjoy.com/feed" htmlUrl="http://www.geeksjoy.com"/>
                  <outline text="日本ACG新闻馆" title="日本ACG新闻馆" type="rss"
                      xmlUrl="http://acg-jp.blog.sohu.com/rss" htmlUrl="http://acg-jp.blog.sohu.com/"/>
                  <outline text="比特客栈的文艺复兴" title="比特客栈的文艺复兴" type="rss"
                      xmlUrl="http://blog.ticktag.org/feed/" htmlUrl="http://blog.ticktag.org"/>
                  <outline text="河蟹娱乐" title="河蟹娱乐" type="rss"
                      xmlUrl="http://feed.kisshi.com/" htmlUrl="http://kisshi.com"/>
                  <outline text="漫谈| 我们的ACG" title="漫谈| 我们的ACG" type="rss"
                      xmlUrl="http://www.acgtalk.com/rss.xml" htmlUrl="http://www.acgtalk.com"/>
                  <outline text="电影评论库" title="电影评论库" type="rss"
                      xmlUrl="http://www.movku.com/feed/" htmlUrl="http://www.movku.com/"/>
                  <outline text="疯狂的设计" title="疯狂的设计" type="rss"
                      xmlUrl="http://hi.baidu.com/madesign/rss" htmlUrl="http://hi.baidu.com/madesign"/>
                  <outline text="硬帮帮帮主胡子的大白床单" title="硬帮帮帮主胡子的大白床单" type="rss"
                      xmlUrl="http://feed.feedsky.com/huzibeer" htmlUrl="http://www.huzibeer.cn"/>
                  <outline text="秋叶原OS" title="秋叶原OS" type="rss"
                      xmlUrl="http://cn.akibaos.com/feed/" htmlUrl="http://cn.akibaos.com"/>
                  <outline text="講。鏟。片" title="講。鏟。片" type="rss"
                      xmlUrl="http://hongkongfilms.mysinablog.com/rss.php" htmlUrl="http://hongkongfilms.mysinablog.com"/>
                  <outline text="都市客 · 良品杂志" title="都市客 · 良品杂志" type="rss"
                      xmlUrl="http://feed.feedsky.com/metroer" htmlUrl="http://m.metroer.com/index.php"/>
                  <outline text="金牌打手张小北" title="金牌打手张小北" type="rss"
                      xmlUrl="http://www.tianyablog.com/blogger/rss.asp?BlogID=5717" htmlUrl="http://x_z_f_d.blog.tianya.cn/"/>
                  <outline text="麦田音乐网" title="麦田音乐网" type="rss"
                      xmlUrl="http://feed.feedsky.com/musblog" htmlUrl="http://www.mtyyw.com"/>
              </outline>
              <outline title="体育" text="体育">
                  <outline text="Goal.com News - 中文"
                      title="Goal.com News - 中文" type="rss"
                      xmlUrl="http://www.goal.com/cn/feeds/news?fmt=rss" htmlUrl="http://www.goal.com/cn/feeds/news?fmt=rss"/>
              </outline>
              <outline title="IT.数码" text="IT.数码">
                  <outline text="CheN's blog" title="CheN's blog" type="rss"
                      xmlUrl="http://isusan.blogbus.com/index.rdf" htmlUrl="http://isusan.blogbus.com"/>
                  <outline text="Crazy Software" title="Crazy Software"
                      type="rss"
                      xmlUrl="http://feed.feedsky.com/CrazySoftware" htmlUrl="http://cs72.com"/>
                  <outline text="E-space" title="E-space" type="rss"
                      xmlUrl="http://feeds.feedburner.com/hhalloyy" htmlUrl="http://e-spacy.com"/>
                  <outline text="EnjoyWeb20" title="EnjoyWeb20" type="rss"
                      xmlUrl="http://enjoyweb20.cn/index.php/feed/" htmlUrl="http://enjoyweb20.cn"/>
                  <outline text="小众软件 - Appinn" title="小众软件 - Appinn"
                      type="rss" xmlUrl="http://feeds.feedburner.com/guigui" htmlUrl="http://www.appinn.com"/>
                  <outline text="小建の软件园" title="小建の软件园" type="rss"
                      xmlUrl="http://www.x-hins.cn/feed.asp" htmlUrl="http://www.X-hins.cn/"/>
                  <outline text="网生代" title="网生代" type="rss"
                      xmlUrl="http://feed.feedsky.com/weborn" htmlUrl="http://feeds.feedburner.com/lightory"/>
              </outline>
              <outline title="乱七八糟" text="乱七八糟">
                  <outline text="Alan's World" title="Alan's World" type="rss"
                      xmlUrl="http://feed.feedsky.com/alanoy" htmlUrl="http://www.alanoy.com"/>
                  <outline text="Google 黑板报 -- Google 中国的博客网志"
                      title="Google 黑板报 -- Google 中国的博客网志" type="rss"
                      xmlUrl="http://googlechinablog.com/atom.xml" htmlUrl="http://googlechinablog.blogspot.com/"/>
                  <outline text="Next--Cool" title="Next--Cool" type="rss"
                      xmlUrl="http://feed.nextcool.cn/" htmlUrl="http://www.nextcool.cn/"/>
                  <outline text="Ray" title="Ray" type="rss"
                      xmlUrl="http://rayche.blogbus.com/index.rdf" htmlUrl="http://rayche.blogbus.com/"/>
                  <outline text="Sub Jam" title="Sub Jam" type="rss"
                      xmlUrl="http://www.yanjun.org/blog/?feed=rss2" htmlUrl="http://www.yanjun.org/blog"/>
                  <outline text="中文HowTO" title="中文HowTO" type="rss"
                      xmlUrl="http://feed.feedsky.com/fadesky" htmlUrl="http://www.fadesky.com"/>
                  <outline text="免了|免费资源社群" title="免了|免费资源社群" type="rss"
                      xmlUrl="http://feed.feedsky.com/mian6" htmlUrl="http://mian6.net/"/>
                  <outline
                      text="原版图书免费下载链接收集站 Free Ebooks Download Rapidshare"
                      title="原版图书免费下载链接收集站 Free Ebooks Download Rapidshare"
                      type="rss" xmlUrl="http://www.cnshare.org/?feed=rss2" htmlUrl="http://www.cnshare.org"/>
                  <outline text="大猫爪" title="大猫爪" type="rss"
                      xmlUrl="http://feeds.feedburner.com/bigcat" htmlUrl="http://ooxx.me"/>
                  <outline text="天気雨" title="天気雨" type="rss"
                      xmlUrl="http://dreamxis.blogbus.com/index.rdf" htmlUrl="http://dreamxis.blogbus.com"/>
                  <outline text="天涯小筑" title="天涯小筑" type="rss"
                      xmlUrl="http://donatino.skygate.cn/rss/rss20/21" htmlUrl="http://donatino.skygate.cn"/>
                  <outline text="天涯海阁" title="天涯海阁" type="rss"
                      xmlUrl="http://feed.web20share.com/" htmlUrl="http://www.web20share.com"/>
                  <outline text="子说" title="子说" type="rss"
                      xmlUrl="http://feed.zishuo.com/" htmlUrl="http://pipes.yahoo.com/pipes/pipe.info?_id=9nL_4jXd3BG7COGXjUnRlg"/>
                  <outline text="撕皮儿剥壳" title="撕皮儿剥壳" type="rss"
                      xmlUrl="http://blog.163.com/alex_dengzh/rss/" htmlUrl="http://blog.163.com/alex_dengzh"/>
                  <outline text="有理链接" title="有理链接" type="rss"
                      xmlUrl="http://feed.feedsky.com/jetlicomcn" htmlUrl="http://top1234.com"/>
                  <outline text="水手音乐" title="水手音乐" type="rss"
                      xmlUrl="http://www.musicsailor.com/feed.asp" htmlUrl="http://www.musicsailor.com/"/>
                  <outline text="温莎鉴赏馆" title="温莎鉴赏馆" type="rss"
                      xmlUrl="http://jessydior.blogbus.com/index.rdf" htmlUrl="http://jessydior.blogbus.com/"/>
                  <outline text="烧荒网" title="烧荒网" type="rss"
                      xmlUrl="http://feed.feedsky.com/moorburn" htmlUrl="http://www.moorburn.com"/>
                  <outline text="爱枣报" title="爱枣报" type="rss"
                      xmlUrl="http://feed.feedsky.com/iamting" htmlUrl="http://www.izaobao.org"/>
              </outline>
              <outline title="Blog" text="Blog">
                  <outline text="Roger" title="Roger" type="rss"
                      xmlUrl="http://roger-xujueqi.blog.163.com/rss/" htmlUrl="http://roger-xujueqi.blog.163.com"/>
                  <outline text="shadow·懂" title="shadow·懂" type="rss"
                      xmlUrl="http://shadow86921.blogcn.com/rss.xml" htmlUrl="http://shadow86921.blogcn.com"/>
                  <outline text="[ZPZONE]" title="[ZPZONE]" type="rss"
                      xmlUrl="http://blog.sina.com.cn/rss/aoizp.xml" htmlUrl="http://blog.sina.com.cn/aoizp"/>
                  <outline text="まだまだだね！" title="まだまだだね！" type="rss"
                      xmlUrl="http://kidszone.blogbus.com/index.rdf" htmlUrl="http://kidszone.blogbus.com"/>
                  <outline text="我呸" title="我呸" type="rss"
                      xmlUrl="http://rss.yculblog.com/milkpig.xml" htmlUrl="http://milkpig.ycool.com/"/>
                  <outline text="最澄" title="最澄" type="rss"
                      xmlUrl="http://rss.ycool.com/blog/zuicheng.xml" htmlUrl="http://zuicheng.ycool.com/"/>
                  <outline text="朱學恆的路西法地獄" title="朱學恆的路西法地獄" type="rss"
                      xmlUrl="http://blogs.myoops.org/xmlsrv/atom.php?blog=5" htmlUrl="http://blogs.myoops.org/lucifer.php"/>
                  <outline text="电气羊亭" title="电气羊亭" type="rss"
                      xmlUrl="http://www.iserlohnwind.com/blog/feed.asp" htmlUrl="http://www.iserlohnwind.com/blog/"/>
                  <outline text="过眼云烟" title="过眼云烟" type="rss"
                      xmlUrl="http://kitpard.blog.sohu.com/rss" htmlUrl="http://kitpard.blog.sohu.com/"/>
                  <outline text="那谁谁的谁" title="那谁谁的谁" type="rss"
                      xmlUrl="http://hi.baidu.com/nasheishei/rss" htmlUrl="http://hi.baidu.com/nasheishei"/>
              </outline>
          </body>
      </opml>
      `)
    xml_content.css("outline").each do |outline|
      xml_url_node = outline.attribute("xmlUrl")
      if xml_url_node
        url = xml_url_node.value
        begin
           RssFeed.create_rss_feed(url)
        rescue Exception => ex
#          p ex
          next
        end
      end
    end
  end

  RssFeed.transaction do
    self.add_rss_feed_from_xml
  end

end
