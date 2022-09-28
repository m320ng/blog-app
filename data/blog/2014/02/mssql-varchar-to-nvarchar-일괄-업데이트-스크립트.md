---
title: "mssql varchar to nvarchar 일괄 업데이트 스크립트"
date: "2014-02-11"
categories: 
  - "code"
tags: 
  - "mssql"
  - "nvarchar"
  - "ntext"
---

테이블 생성 스크립트를 파싱해서 ALTER 구문 생성. 간단하게 PHP스크립트로 생성했다.

## VARCHAR -> NVARCHAR

1. 제약구문 제거
    
2. ALTER COLUMN (VARCHAR => NVARCHAR)
    
3. 제약구문 추가 (기본값구문)
    

# 소스

```
<?php
$text = read_file("scheme.txt");

$lines = explode("\n", $text);

$alter_columns = array();
$drop_consts = array();

$not_null_tables = array();
$not_null_columns = array();
$null_tables = array();
$null_columns = array();

foreach ($lines as $line) {
    $find_start = "CREATE TABLE [dbo].[";
    $pos = strpos($line, $find_start);
    if ($pos!==false) {
        $pos2 = strpos($line, "]", $pos);
        $pos += strlen($find_start);
        $table_name = trim(substr($line, $pos, $pos2 - $pos));
    }
    if ($table_name) {
        $vchr_word = "[varchar](";
        $pos = strpos($line, $vchr_word);
        if ($pos!==false) {
            $column_name = trim(str_replace("[", "", str_replace("]", "", substr($line, 0, $pos))));
            $pos += strlen($vchr_word);
            $pos2 = strpos($line, ")", $pos);
            $vchr_len = trim(substr($line, $pos, $pos2 - $pos));
            if ($vchr_len=="max") {
                $nvchr_len = "max";
            } else {
                $nvchr_len = ($vchr_len*3);
            }
            if ($nvchr_len==765) $nvchr_len = 780;
            if ($nvchr_len>=6000) $nvchr_len = "max";
            $null_check = trim(str_replace(",", "", substr($line, $pos2 + 1)));

            $alter_columns[] = "ALTER TABLE [$table_name] ALTER COLUMN [$column_name] nvarchar($nvchr_len) $null_check";

            if (strtolower($null_check)=="not null") {
                $not_null_tables[] = $table_name;
                if (!$not_null_columns[$table_name]) $not_null_columns[$table_name] = array();
                $not_null_columns[$table_name][] = $column_name;
            } else {
                $null_tables[] = $table_name;
                if (!$null_columns[$table_name]) $null_columns[$table_name] = array();
                $null_columns[$table_name][] = $column_name;
            }
        }
    }
}

$max_line = count($lines);
foreach ($lines as $index=>$line) {
    if ($index == $max_line - 1) {
        $last_line = true;
    }

    //$last_line
    $find_start = "/****** Object:  Default [";

    if (!$last_line && strpos($line, $find_start)!==false) {
        $df_name = find_with($line, "/****** Object:  Default [", "]");
        if ($df_name) {
            $line = $lines[$index+1];
            // alter line
            $table_name = find_with($line, "ALTER TABLE [dbo].[", "]");
            $column_name = find_with($line, "FOR [", "]");
            if (in_array($table_name, $not_null_tables) && in_array($column_name, $not_null_columns[$table_name])) {
                $drop_consts[] = "ALTER TABLE [$table_name] DROP CONSTRAINT $df_name";
                $add_consts[] = "ALTER TABLE [$table_name] ADD DEFAULT N'' FOR [$column_name]";
            }
            if (in_array($table_name, $null_tables) && in_array($column_name, $null_columns[$table_name])) {
                $drop_consts[] = "ALTER TABLE [$table_name] DROP CONSTRAINT $df_name";
            }
        }
    }
}

foreach($drop_consts as $text) {
    echo $text."\n";
}
if ($not_null_tables) {
    foreach($not_null_tables as $table) {
        if ($not_null_columns[$table]) {
            foreach($not_null_columns[$table] as $column) {
                echo "UPDATE [".$table."] SET [$column] = '' WHERE [$column] IS NULL\n";
            }
        }
    }
}
foreach($alter_columns as $text) {
    echo $text."\n";
}
foreach($add_consts as $text) {
    echo $text."\n";
}

function find_with($target, $start, $end) {
    $pos = strpos($target, $start);
    if ($pos!==false) {
        $pos += strlen($start);
        $pos2 = strpos($target, $end, $pos);
        return trim(substr($target, $pos, $pos2 - $pos));
    }
    return null;
}

function read_file($filename, $size = 0)
{
    if(!file_exists($filename)) return "";
    $f = fopen($filename, "r");
    if(!$size) $size = filesize($filename);
    if($size) $str = fread($f, $size);
    fclose($f);

    return $str;
}

?>
```

## TEXT -> NTEXT

생성되는 구문만 좀 더 길어졌을뿐 위소스와 거의 흡사하다.

1. 제약구문 제거
    
2. TEXT컬럼 \_old 붙여서 rename
    
3. TEXT컬럼을 NTEXT로 add
    
4. old내용을 추가한컬럼으로 update
    
5. old컬럼 drop
    
6. 제약구문 추가 (기본값)
    

# 소스

```
<?php
$text = read_file("scheme.txt");

$lines = explode("\n", $text);

$alter_columns = array();
$drop_consts = array();

$not_null_tables = array();
$not_null_columns = array();
$null_tables = array();
$null_columns = array();

foreach ($lines as $line) {
    $find_start = "CREATE TABLE [dbo].[";
    $pos = strpos($line, $find_start);
    if ($pos!==false) {
        $pos2 = strpos($line, "]", $pos);
        $pos += strlen($find_start);
        $table_name = trim(substr($line, $pos, $pos2 - $pos));
    }
    if ($table_name) {
        $vchr_word = "[text]";
        $pos = strpos($line, $vchr_word);
        if ($pos!==false) {
            $column_name = trim(str_replace("[", "", str_replace("]", "", substr($line, 0, $pos))));
            $pos += strlen($vchr_word);
            $pos2 = strpos($line, " ", $pos);
            $vchr_len = trim(substr($line, $pos, $pos2 - $pos));
            if ($vchr_len=="max") {
                $nvchr_len = "max";
            } else {
                $nvchr_len = ($vchr_len*3);
            }
            if ($nvchr_len==765) $nvchr_len = 780;
            if ($nvchr_len>=6000) $nvchr_len = "max";
            $null_check = trim(str_replace(",", "", substr($line, $pos2 + 1)));

            if (strtolower($null_check)=="not null") {
            $alter_columns[] = <<<PERL_STRING
exec sp_rename '$table_name.$column_name', '${column_name}_old'
go
ALTER TABLE [$table_name] ADD [$column_name] ntext $null_check DEFAULT N''
go
update [$table_name] set [$column_name] = [${column_name}_old]
go
ALTER TABLE [$table_name] DROP COLUMN [${column_name}_old]
go

PERL_STRING;

                $not_null_tables[] = $table_name;
                if (!$not_null_columns[$table_name]) $not_null_columns[$table_name] = array();
                $not_null_columns[$table_name][] = $column_name;
            } else {
            $alter_columns[] = <<<PERL_STRING
exec sp_rename '$table_name.$column_name', '${column_name}_old'
go
ALTER TABLE [$table_name] ADD [$column_name] ntext $null_check
go
update [$table_name] set [$column_name] = [${column_name}_old]
go
ALTER TABLE [$table_name] DROP COLUMN [${column_name}_old]
go

PERL_STRING;
                $null_tables[] = $table_name;
                if (!$null_columns[$table_name]) $null_columns[$table_name] = array();
                $null_columns[$table_name][] = $column_name;
            }
        }
    }
}

$max_line = count($lines);
foreach ($lines as $index=>$line) {
    if ($index == $max_line - 1) {
        $last_line = true;
    }

    //$last_line
    $find_start = "/****** Object:  Default [";

    if (!$last_line && strpos($line, $find_start)!==false) {
        $df_name = find_with($line, "/****** Object:  Default [", "]");
        if ($df_name) {
            $line = $lines[$index+1];
            // alter line
            $table_name = find_with($line, "ALTER TABLE [dbo].[", "]");
            $column_name = find_with($line, "FOR [", "]");
            if (in_array($table_name, $not_null_tables) && in_array($column_name, $not_null_columns[$table_name])) {
                $drop_consts[] = "ALTER TABLE [$table_name] DROP CONSTRAINT $df_name\ngo";
                $add_consts[] = "ALTER TABLE [$table_name] ADD DEFAULT N'' FOR [$column_name]\ngo";
            }
            if (in_array($table_name, $null_tables) && in_array($column_name, $null_columns[$table_name])) {
                $drop_consts[] = "ALTER TABLE [$table_name] DROP CONSTRAINT $df_name\ngo";
            }
        }
    }
}

foreach($drop_consts as $text) {
    echo $text."\n";
}
foreach($alter_columns as $text) {
    echo $text."\n";
}
foreach($add_consts as $text) {
    echo $text."\n";
}

function find_with($target, $start, $end) {
    $pos = strpos($target, $start);
    if ($pos!==false) {
        $pos += strlen($start);
        $pos2 = strpos($target, $end, $pos);
        return trim(substr($target, $pos, $pos2 - $pos));
    }
    return null;
}

function read_file($filename, $size = 0) {
    if(!file_exists($filename)) return "";
    $f = fopen($filename, "r");
    if(!$size) $size = filesize($filename);
    if($size) $str = fread($f, $size);
    fclose($f);

    return $str;
}
?>
```
