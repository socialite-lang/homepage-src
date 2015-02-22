```
title: Documentation
layout: page
pageOrder: 3
```

SociaLite is a distributed query language for graph analysis and data mining.
This document describes the syntax and core semantics of SociaLite. 
For an informal introduction to SociaLite, see [quick start](../quick_start).

<i> The documentation is not complete yet; we will soon have a complete documentation.</i>

### <b> Table of Contents</b>
* [Introduction](#intro)
* [Basics](#basics)
 * [Tables](#tables)
 * [Rules](#rules)
 * [Functions](#functions)
* [Python Integration](#integr)
* [Example Programs](#examples)
----

## <a class="anchor" name="intro"></a> <b>Introduction</b>

SociaLite is based on [Datalog](http://en.wikipedia.org/wiki/Datalog#cite_note-1), 
hence it supports [declarative programming](http://en.wikipedia.org/wiki/Declarative_programming).
SociaLite programmers <i>declare</i> distributed in-memory tables; then, SociaLite rules are <i>declared</i> to access the tables, and perform relational operations. The rules can be evaluated in parallel on a single multi-core machine or on a cluster of distributed machines.
<br>Aggregation is supported in SociaLite; common aggregate operations such as <i>min</i>, <i>max</i>, and <i>sum</i> are provided as a built-in function, and user-defined functions are also supported.
<br>SociaLite queries can be embedded in Python programs. The embedded queries are executed against an implicitly declared SociaLite database that stores the declared tables and rules.

## <a class="anchor" name="basics"></a> <b>Basics</b>
Tables and rules are the basic programming concepts in SociaLite.

### <a class="anchor" name="tables"></a> <b>Tables</b>

Tables are the primary data structure in SociaLite that stores user data. Tables are stored in memory, possibly distributed across cluster machines. 

A SociaLite table is declared with the following syntax:
```
Table(type col1, ... , (type coli, ...)) opts.
```
The <i>type</i> denotes the type of the declared column, which can be either primitive types (int, long, float, and double) or object types (String and user-defined types).
The parenthesis indicates that the enclosed columns are nested. For example, the following declaration represents a two-column table with the second column nested, representing an adjacency list.
```
Edge(int src, (int target)).
```

A range operator, specifying that the value of the column is within the given range, can be applied to the first column of a table or to the first column of nested tables. The following example shows a range operator applied to the Edge table.
```
Edge(int src:0..1000, (int target)).
```
The first column of the Edge table should be within the given range -- that is, between 0 and 1000. 
Moreover, if the range operator is used, SociaLite compiler optimizes the column to be represented by array indices; 
so the memory footprint of Edge table is smaller, and lookup by the first column value is much faster.

SociaLite tables are horizontally partitioned, or <i>sharded</i>, by its first column and stored across distributed machines when running on a distributed cluster. When running on a single machine, the partitions of a table can be processed by different cores at the same time for parallel processing.

By default *hash-based partitioning* is used; the hash of the first column value determines the partition to store the tuples. If a range operator is in the table declaration, then *range-based partitioning* is used, where
the range is divided up into consecutive subranges and evenly distributed across the partitions.

#### <a class="anchor" name="table-opts"></a> <b>Table Options</b>

Following describes the table options that can be used in table declarations

<table class="table-striped table-bordered table-condensed" width="720" style="margin-left:20px">
<thead> <tr>
<th class="span3">Option </th> <th class="span4">Description </th>
</tr> </thead>
<tbody>
<tr><td>indexby</td>
    <td>adds index to the given column. e.g. Edge(int src, (int target)) indexby src. </td></tr>
<tr><td>sortby</td>
    <td>sorts the table by the given column. e.g. Edge(int src, (int target)) sortby target. </td></tr>
<tr><td>multiset</td>
    <td>specifies that the table is multiset. 
        This option makes insertion faster because 
        it is not necessary to check if the inserted tuple already exists in the table.
        e.g. Edge(int s, (int t)) multiset. </td></tr>
</tbody>
</table>


### <a class="anchor" name="rules"></a> <b>Rules</b>

In SociaLite, programming logic is expressed in rules.
SociaLite rules are declarative just like SQL queries.

A SociaLite rule is declared as following.

```
Head(p_1, p_2, ..., p_N) :- Body1(a_1, a_2, ..), Body2(b_1, b_2, ...), ... BodyN(x_1, x_2, ...).

```
The left side of column-dash is rule head, and the right side is rule body. In short, the above rule processes (joins) the tables in the body -- Body1, Body2, ..., BodyN -- and inserts the result into the Head table in the rule head.

The following is an example SociaLite rule that finds friends-of-friends:

```
Foaf(i, ff) :- Friend(i, f), Friend(f, ff).

```
Assume that Friend table stores the friendship relation.
In the body of the above rule, the Friend table is joined with itself, where the variable f indicates the join key, 
and appears as the second column in the left side of the join, and the first column in the right side of the join. 
In the head, the join result is stored in the Foaf table.

In other words, the query is evaluated as follows. For each tuple (i, f) in Friend (the first table in the body), we find matching tuples (f, ff) in Friend (second table in the body), whose first column matches with the second column of (i, f). After the matching, we store the result (i, ff) into Foaf table.

### <a class="anchor" name="functions"></a> <b>Functions</b>

SociaLite allows Java and Python (Jython) functions to be used in SociaLite rules. The functions are prefixed with dollar sign as in the following example:

```
Edge(s, t) :- l=$read("hdfs://data/graph.txt"), (a,b)=$split(l, ","), s=$toInt(a), t=$toInt(b).

```

The above rule uses three built-in functions: $read, $split, and $toInt. The $read function reads from the given file and yields lines in the file. The $split function splits the given parameter with the second parameter as the delimiter. The function $toInt converts the string argument to int type. These built-in functions are defined in [Builtin.java](https://github.com/socialite-lang/socialite/blob/master/src/socialite/functions/Builtin.java).

User-defined functions are allowed in Java and Python. In Java, define a static method of a class in package ```socialite.functions``` and in SociaLite rule use $class_name.method_name to access the method. Example functions can be found in [Builtin.java](https://github.com/socialite-lang/socialite/blob/master/src/socialite/functions/Builtin.java).
In Python define a function, and use @returns(return-type) annotation to specify the return type, as following example:

```
@returns(int)
def primeBiggerThan(a):
  while True:
    if isPrime(a): return a
    else: a+=1

```

## <a class="anchor" name="integr"></a> <b>Python Integration</b>

We extended Python (Jython) interpreter so that SociaLite queries can be embedded within Python code.
The extended interpreter (bin/socialite in the SociaLite distribution) preprocesses SociaLite queries into a function call (to SociaLite compiler). SociaLite queries are quoted with backtick(`) as in the following example:

```
print "this is Python code"

`Edge(s, t) :- l=$read("hdfs://data/graph.txt"), (a,b)=$split(l, ","), s=$toInt(a), t=$toInt(b).`

for s,t in `Edge(s,t)`:
    print s,t

```

Python functions and variables can be accessed within SociaLite code; a dollar prefix indicates that the variable or function is externally defined as following:

```
N = 1000
`Edge(int s:0..$N, (int t)).`

src = 10
# prints edges of node 10
for _, t in `Edge($src, t)`: 
    print "10 -->",t
```

## <a class="anchor" name="examples"></a> <b>Example Programs</b>

### Analysis of DBLP co-authorship graph
Example code: https://github.com/socialite-lang/cs243

The program (code/sp.py and code/pr.py) uses shortest-paths and PageRank algorithm to analyze the DBLP co-authorship graph.

### Analysis of Medicare-B Dataset
Example code: https://github.com/ofermend/medicare-demo

The program (code/find-anomalies.py) uses personalized PageRank to find anomalies in the Medicare dataset.
More details are decribed in the blog post.
