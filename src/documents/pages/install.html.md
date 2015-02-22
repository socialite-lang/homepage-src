```
title: Install
layout: page
pageOrder: 1
```
#### <b>Requirements</b>

* Java 1.6 or higher: [Download](http://java.com/en/download/index.jsp)


#### <b>Download</b>
* SociaLite 0.8.0-alpha: [Download binary](http://mobisocial.stanford.edu/socialite/socialite.tar.gz)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp; [GitHub repository](https://github.com/socialite-lang/socialite): requires Apache-ant to build.


#### <b>Setup</b>
1. Untar the downloaded file: ```tar -xvf socialite.tar.gz```  This will create a folder ```socialite/```.
2. Set JAVA_HOME environment variable in your shell. 
You can also set JAVA_HOME in ```conf/socialite-env.sh```.
3. Optionally, edit ```conf/socialite-env.sh``` to adjust the heap size for SociaLite runtime with the SOCIALITE_HEAPSIZE variable.
4. Run ```bin/socialite``` to start the interactive shell. 
If you see the following message, the installation for a single machine is complete.

    ```python
    PySociaLite (Python integrated SociaLite) 0.8.0-alpha
    Type "help" for more information.
    Type "quit()" to quit.

    >>>
    ```
5. Now you can jump to [Quick Start](../quick_start) or continue to cluster setup.

#### <b>Cluster Setup</b>

6. Edit ```conf/master``` and ```conf/slaves``` to add master/slave machine names. The master node compiles SociaLite queries, and slave nodes execute the compiled queries. Master node also keeps track of liveness of slave nodes. Note that the master node can also serve as a slave node at the same time.

7. Unpack ```socialite.tar.gz``` into all the cluster machines, in the same path. The root of the distribution is referred as SOCIALITE_HOME. 

8. Edit ```conf/socialite-env.sh``` to change SOCIALITE_BASE_PORT. SociaLite runtime uses up to 10 port numbers from the SOCIALITE_BASE_PORT for the internal communication (SOCIALITE_BASE_PORT, SOCIALITE_BASE_PORT+1, ..., SOCIALITE_BASE_PORT+9).

9. Edit ```conf/socialite-env.sh``` to change SOCIALITE_WORKER_NUM (the number of worker threads in each slave node). If SOCIALITE_WORKER_NUM is not set, the number of cores in one of slave nodes will be used for SOCIALITE_WORKER_NUM.

10. Optionally, you can set HADOOP_HOME variable in ```conf/socialite-env.sh``` if your SociaLite program accesses HDFS (Hadoop Distributed File System).

11. Optionally, you can change log level in ```conf/log4j.properties```.

12. Run ```bin/start-servers.sh``` to start master/slave servers. ```bin/stop-servers.sh``` will stop all the running master/slave servers, and ```bin/kill-servers.sh``` will force stop all the servers. 

13. Run ```bin/socialite -d``` to start the interactive shell connected to the cluster. 

14. To check the recent logs in master/slave servers, run ```bin/tail-logs```.
