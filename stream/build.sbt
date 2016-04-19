name := "stream"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  javaJdbc,
  javaEbean,
  cache
)

libraryDependencies += "redis.clients" % "jedis" % "2.8.1"
     

play.Project.playJavaSettings
