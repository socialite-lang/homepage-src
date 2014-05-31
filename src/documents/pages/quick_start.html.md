```
title: Quick Start
layout: page
pageOrder: 2
```

<br>

SociaLite is a parallel/distributed query language. SociaLite queries are embedded in Java programs or Python (Jython) scripts, and compiled to parallel/distributed Java code. The easiest way to learn SociaLite is through the SociaLite interactive shell.

### <b>Starting a SociaLite Shell (Single Machine)</b>

To start using the SociaLite interactive shell, first [install SociaLite](../install) and run ```bin/socialite```. To run a script, pass the script name such as ```bin/socialite script-name.py```.
The SociaLite interactive shell is basically a Jython shell extended to support SociaLite queries. 
Normally the shell expects Python code, and SociaLite queries are enclosed in backtik(`), like following.
Click the <b>>>></b> on the top-right to hide the prompts.

``` python
>>> print "Python code"
'''Python code'''
>>> # Next two lines are SociaLite code
>>> `Friend(String n, String f).
...  Friend(n, f) :- n="John", f="Tom".`
>>> # Iterating over a table
>>> for n, f in `Friend(n, f)`:
...     print n, f
'''John    Tom'''
```

The above SociaLite query creates a two-column table *Friend*, inserts one tuple {"John", "Tom"} into the table, and iterates over the table to print the tuples.

### <a class="anchor" name="tables"></a><b>Tables</b>

In SociaLite, data is stored in (in-memory) tables, which can be declared as following.

``` python
>>> `FriendNum(String name, int num).`
```

This declares a table *FriendNum* that has two columns with String and int type.  Column types can be primitive types (int, long, float, and double), object types (String, Utf8, and user-defined types), and array types (int[], String[], etc). Notice that table declarations must end with a dot (.).

Tables can have nested structures. Nesting is indicated by parenthesis as in * Friend(String i, (String f)). *.  The nesting must be at the end -- so, *Foo(int x, (int y, int z)).* is allowed, but *Foo(int x, (int y), int z).* is not. Multiple nestings are supported as in *Foo(int x, (int y, (int z))).*

Columns can have options; the followings are some of popular options.

1. *Range option*  -- e.g. * Foo(int i:0..10, (int j:0..20, String f, (int k:0..5))). *

    Range option is for columns whose values are within a given ranges. In the example above, the first column of Foo table has values ranging from 0 to 10.  Only the first column and first of nested columns can have the range options -- the *i*,*j*,*k* columns in the above. This option allows SociaLite to optimize the columns to be represented as array indices. 

2. *Indexby option* -- e.g. * Bar(String s, double v) indexby s. *

    This option adds an index to a given column. The first column of the Bar table in the example is indexed, which can make join operations faster.

3. *Iter option* -- e.g. * Qux(int n, int i:iter, int v). *

    This option is used for a table having values that are updated inside a loop.  The option supports fast access to the values at current and previous iterations by storing only the values of last two iterations.  For example, the rule ```Qux(s, 2, x) :- Qux(s, 1, x1), x=x1+42.``` is executed faster with the option, because Qux table only stores the values of iteration 1 and 2. See PageRank demo for an example.

To iterate elements over a table, you can simply do following

``` python
>>> for i, j, f in `Foo(i, j, f)`:
...     print i,j,f
```

Tables are logically partitioned with respect to its first column. That is, tables are horizontally partitioned, and the value of the first column of a tuple determines in which partition the tuple is stored.  Because of the partitioning, iteration of a sorted table may not yield tuples in the sorted order.

### <b>Rules</b>

In SociaLite, programming logic is expressed in *rules*. An example of a rule is shown in following.

```python
>>> # first, declare tables
>>> `Foaf(String a, String b) indexby a.
...  Friend(String a, String b) indexby a.`
>>> # then, run the following rule
>>> `Foaf(i, ff) :- Friend(i, f), Friend(f, ff).`
```

In the above rule, the Friend table in the rule body -- right-hand side of :- -- is joined with Friend table itself, and the result is inserted into the Foaf table in the rule head -- left-hand side of :- . More specifically, the term *Friend(i,f)* iterates each tuple from Friend table, and assigns to variable *i*, *f*; for the assigned value of *f*, matching tuples from Friend table are retrieved and assigned to variable *ff*, and the result tuple {i, ff} is added to Foaf table.  If the Friend table contains three tuples {'a','b'}, {'b','c'}, {'b','d'}, then the following two tuples, {'a','c'} and {'a','d'}, are inserted to Foaf table. In other words, the above rule finds friends-of-friends and store them in the Foaf table.

Selecting particular tuples can be done like following.

```python
>>> `TomsFoaf(String f) indexby f.`
>>> `TomsFoaf(ff) :- Friend("Tom", f), Friend(f, ff).`
```

Here in *Friend("Tom", f)*, we select only the tuples whose first column value exactly matches "Tom".  For each of such tuples, we find matching tuples in *Friend(f, ff)*, and add Tom's friends of friends in TomsFoaf table.

In the following example, Foaf table stores friends as well as friends-of-friends.

```python
>>> `Foaf(i, f) :- Friend(i, f).
...  Foaf(i, ff) :- Friend(i, f), Friend(f, ff).`
```

The first rule adds tuples from Friend table into Foaf table, and the next rule adds friends-of-friends to Foaf table. Basically the result of the two rules are unioned and stored in Foaf table.

Each rule is evaluated in parallel -- the logical partitions in the first table of the rule body are accessed by multiple cores, which evaluate the rule in parallel.

#### Functions and Aggregate Functions 

SociaLite rules support Python functions. Python functions in rules are prefixed with a dollar ($) sign as in the following example.

```python
>>> @returns(str)
... def getLastName(fullname):
...     f,l = fullname.split(' ')
...     return l
... 
>>> # declare tables
>>> `Friend(String n, String f) indexby n.
...  FriendLastName(String n, String l) indexby n.`
>>> # insert a tuple into Friend table
>>> `Friend(i, f) :- i="Tom Hanks", f="Tom Cruise".`
>>> `FriendLastName(i, l) :- Friend(i, f), l=$getLastName(f).`
```
In the example, we first defined a function *getLastName* that returns the last name given a full name. Notice that the function is declared with a decorator *returns* which declares the type of the return value -- string type, in the above case.
Then we declare tables, and insert a tuple {"Tom Hanks", "Tom Cruise"} into the Friend table. The next rule computes friends' last names and stores in the FriendLastName table.


Aggregate functions are also supported as in the following example

```python
>>> @returns(int)
... def incBy(n, inc):
...     return n+inc
... 
>>> `FriendCnt(String n, int cnt) indexby n.`
>>> `FriendCnt(n, $incBy(1)) :- Friend(n, f).`
```

We define an aggregate function *incBy* that takes two numbers and returns the sum. Then we declare FriendCnt table that stores the number of friends for each person. In the next rule, we iterate tuples in the Friend table, and increment the friend count for person *n* by 1. That is, for each tuple {n,f} in the Friend table, SociaLite groups the FriendCnt table by the value of *n* to get the current friend count of *n*. The current count is passed to the *incBy* function along with the arguments specified in the rule -- 1 in the example. The count in the table is updated with the return value of the function, which is the current count incremented by one.

** Built-in Functions **

SociaLite supports various built-in functions and aggregate functions.
Here we list a few of them; for a complete list, please see [Documentation](../documentation).

<table class="table-striped table-bordered table-condensed" width="720" style="margin-left:20px">
<thead> <tr>
<th class="span3">Function </th> <th class="span4">Description </th>
</tr> </thead>
<tbody>
<tr><td>$read("path-to-file")</td>
    <td>returns lines in a given file. e.g. l=$read("./a.txt") </td></tr>
<tr><td>$split("src-str", "delim"[, maxsplit])</td>
    <td>returns the splitted string. e.g. (a,b,c)=$split(line, ";") </td></tr>
<tr><td>$splitIter("src-str", "delim")</td>
    <td>splits the string, and returns the splitted string one by one. e.g. a=$splitIter(line, "\t")</td></tr>
<tr><td>$max(n), $min(n)</td>
    <td>aggregate function computing max/min</td></tr>
<tr><td>$sum(n)</td>
    <td>aggregate function that computes the sum</td></tr>
</tr>
</tbody>
</table>

For example, to read comma-separated values in a text file, you can write as following:

```python
>>> `Values(int a, int b).`
>>> `Values(a,b) :- l=read("path/to/file.txt"), (v1,v2)=$split(l), a=$toInt(v1), b=$toInt(v2).`
```

### <b>Starting a SociaLite Shell (Cluster)</b>

The SociaLite programs can run on a cluster running SociaLite servers. Setting up a SociaLite cluster is described in [install SociaLite](../install). Once the cluster is set up, SociaLite shell can be executed with ```-d``` option to connect to the cluster, like ```bin/socialite -d```.  To run a script in the cluster, pass the script name like ```bin/socialite -d script-name.py```.

### <a class="anchor" name="dist-tables"></a><b>Distributed Tables</b>

SociaLite supports distributed tables whose partitions are stored across cluster machines.
A distributed table can be declared using a location operator [] in its first column as in following.

``` python
>>> `Foo[int i:0..100](double d).
>>>  Bar[int a]((int b)).
>>>  Qux[String s](int b).`
```

A distributed table stores tuples in one of its partitions -- the values of the partitioning column (first column) of the tuples determine which partition the tuples are stored in.

**Range-based partitioning**
If a range operator is applied as in Foo table above, then tuples having first column values within a certain range are stored in a same partition.  For example, for the Foo table, if there are two machines in the cluster, tuples with values from 0 to 50 in the first column are stored in one machine, and the rest tuples are stored in another machine.

**Hash-based partitioning**
If the location operator is used without the range operator -- as in Bar and Qux table above -- we apply hash-based partitioning where the hash of the first column value is used to determine the location to store a given tuple.

As opposed to distributed tables, tables that are declared without the location operator are machine-local tables (or simply local tables). Unlike distributed tables whose partitions are stored across cluster machines, partitions of local tables are entirely stored in individual machine. In other words, distributed tables have a single instance that is stored across cluster machines, and local tables have multiple instances -- one per each machine. Local tables are only accessed from the machine the tables are stored -- more details are explained in [Distributed Rules](#dist-rules).


### <a class="anchor" name="dist-rules"></a><b>Distributed Rules</b>

Rules that are accessing one or more distributed tables are distributed rules. An example of a distributed is shown in following.

```python
>>> `Friend[String i]((String f)).
>>>  Foaf[String i]((String ff)).`
>>> 
>>> `Foaf[i](ff) :- Friend[i](f), Friend[f](ff).`
```

We declare two distributed tables (with nested second columns) and we compute friends-of-friends with the distributed tables. The rule requires distributed join operation; in the rule body, the two terms -- *Friend[i](f)* and *Friend[f](ff)* -- have different values in the partitioning column -- *i* and *f*. Hence tuples from the first term might need to be sent to other machines for the join operation. That is, tuple {i,f} stored in one machine (determined by *i*) needs to be transfered to another machine, where tuple {f, ff} is stored. Then the result tuple {i, ff} needs to be transfered back to be stored to Foaf.

Users may want to re-order the terms in the rule body to minimize data communication for better performance. For example, in the following example, <i>Rule 1</i> has more communication than <i>Rule 2</i>.

```python
>>> `TriangleCount[int i:0..0](int cnt).`
>>> 
>>> # Rule 1
>>> `TriangleCount[0]($inc(1)) :- Friend[x](y), Friend[y](z), Friend[x](z).` 
>>> 
>>> # Rule 2
>>> `TriangleCount[0]($inc(1)) :- Friend[x](y), Friend[x](z), Friend[y](z).`
```
** Built-in Functions for HDFS **

SociaLite supports reading data from HDFS with the following built-in functions.

    $hdfsRead("path-to-file"): reads the file from HDFS in parallel and returns lines, e.g. l=$hdfsRead("data.txt")

<i>More documentation is coming soon! </i>
