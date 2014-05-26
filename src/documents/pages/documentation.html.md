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
* [Python Integration](#integr)
* [Extending SociaLite](#extending)
* [Advanced Topics](#advanced)
* [Example Programs](#examples)
----

## <a class="anchor" name="intro"></a> <b>Introduction</b>

SociaLite is based on [Datalog](http://en.wikipedia.org/wiki/Datalog#cite_note-1), 
hence it supports [declarative programming](http://en.wikipedia.org/wiki/Declarative_programming).
SociaLite programmers <i>declare</i> distributed in-memory tables; then, SociaLite rules are <i>declared</i> to access the tables, and perform relational operations. The rules are evaluated in parallel on a single multi-core machine as well as on a cluster of multiple machines.
<br>Aggregation is supported in SociaLite; common aggregate operations such as <i>min</i>, <i>max</i>, and <i>sum</i> are provided as a built-in function, and user-defined functions are also supported.
<br>SociaLite queries can be embedded in Python programs. The embedded queries are executed against an implicitly declared SociaLite database that stores the declared tables and rules.

## <a class="anchor" name="basics"></a> <b>Basics</b>
Tables and rules are the basic programming concepts in SociaLite.

### <a class="anchor" name="tables"></a> <b>Tables</b>

Tables are the primary data structure in SociaLite that stores user data. Tables are stored in memory, possibly distributed across cluster machines. 
<br>SociaLite has two types of tables -- distributed tables and local tables. Distributed tables are horizontally partitioned tables that are stored across cluster machines. Local tables are tables that are stored entirely on a single machine; individual machines in a cluster stores its own instance of a local table, and the table is only accessible from the machine that owns it. 

A local table is declared with the following syntax:
```
Table(type col1, ... , (type coli, ...)) opts.
```
The <i>type</i> denotes the type of the declared column, which can be either primitive types (int, long, float, and double) or object types (String and user-defined types).
The parenthesis indicates that the enclosed columns are nested. For example, the following declaration represents a two-column table with the second column nested, representing an adjacency list.
```python
Edge(int src, (int target)).

```

A distributed table is declared with the partitioning operator [ ] applied to the first column as following:
```
Table[type col-name1](type col-name2, ... , (type col-namei, ...)) opts.
```

The declared table is horizontally partitioned (or, <i>sharded</i> with respect to the value of the partitioning column. By default hash-based partition is applied, and range-based partition is also supported.

#### <a class="anchor" name="table-opts"></a> <b>Table Options</b>

<i>Table options will be decribed in this section soon!</i>


### <a class="anchor" name="rules"></a> <b>Rules</b>

In SociaLite, programming logic is expressed in rules.
SociaLite rules are declarative just like SQL queries.

### <b>Recursive Rules</b>


### <b>Functions </b>
#### <b>Builtin Functions</b>
#### <b>User-Defined Functions</b>

## <a class="anchor" name="integr"></a> <b>Python Integration</b>

## <a class="anchor" name="extending"></a> <b>Extending SociaLite</b>

## <a class="anchor" name="advanced"></a> <b>Advanced Topics</b>


## <a class="anchor" name="examples"></a> <b>Example Programs</b>

### PageRank
### Shortest Paths
### K-Means
