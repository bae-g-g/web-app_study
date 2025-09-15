# 센서별 맞춤형 이상 온도 감지 및 로깅 시스템


>  각 센서별로 다른 온도 임계값(Threshold)을 설정하고, 이를 초과하는 이상 상황을 실시간으로 감지하여 기록하는 지능형 모니터링 시스템을 MySQL로 구현한 프로젝트입니다.

## 목차
1. 프로젝트 의미
    - 프로젝트 목적
    - 프로젝트 개요
    - 기술 스택 및 개발 환경
2. 구현 내용
    - 보안을 위한 전용 계정 설정
    - 스키마 설계
    - 데이터 시뮬레이션 및 이상 감지
3. 학습 내용
    - 데이터베이스 개요 
    - 데이터베이스 시스템
<br>

# 1. 프로젝트 의의


<br><details>
<summary>   프로젝트 목적  </summary>

* **관계형 데이터베이스 설계**: 목적에 따라 `sensors` (설정 정보) 테이블과 `temperature_logs` (시계열 데이터) 테이블을 분리하고, **PK와 FK**로 관계를 맺어 데이터의 정합성과 확장성을 확보했습니다.

* **JOIN을 활용한 데이터 통합**: 분리된 두 테이블을 `JOIN`하여, 각 센서의 **'고유 임계값'**을 기준으로 이상 온도를 판단하는 복합적인 데이터 조회 능력을 증명합니다.

* **실무 지향적인 쿼리 작성**: 단순 CRUD를 넘어, 실제 모니터링 시스템에서 요구되는 **'위험 상황 감지'**라는 구체적인 비즈니스 요구사항을 SQL로 해결하는 능력을 보여줍니다.



</details><br>
 
---
<br>
<details><summary> 프로젝트 개요  </summary>
<br>

> 단순히 온도를 기록하는 것을 넘어, **"A센서는 80도가 위험하지만, B센서는 50도만 넘어도 위험하다"** 와 같이 각기 다른 환경에 놓인 센서들을 지능적으로 관리할 필요가 있습니다.
이 프로젝트는 정적인 설정(하드코딩)이 아닌, 데이터베이스에 저장된 동적인 설정값을 기준으로 데이터를 분석하는, 한 단계 더 발전된 데이터 처리 능력을 갖추는 것을 목표로 합니다.


</details><br>

---

<br>
<details>
<summary>   기술 스택 및 개발 환경 </summary>

* **Database**: MySQL

* **Language**: SQL


</details><br>

<br>


# 2. 구현 내용


<br><details><summary> 보안을 위한 전용 계정 설정 </summary>

> root 계정 대신, 설정 관리용 사용자(server_admin)를 생성하고 server_db에 대한 CRUD 권한만 부여했습니다.

~~~bash
# 전용 사용자 생성 학습목적 개인 프로젝트이므로 pw는 123
CREATE USER 'temperature_admin'@'localhost' IDENTIFIED BY 123;

# my_server 데이터베이스의 모든 테이블에 대한 CRUD 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON my_server.* 
TO 'temperature_admin'@'localhost';
FLUSH PRIVILEGES;
~~~

<br></details><br>

---

<br><details><summary> 스키마 설계 </summary>

> 센서의 '설정 정보'와 '측정된 데이터'를 명확히 분리하여 두 개의 테이블로 설계했습니다.

 
### 센서 설정 정보 테이블 (sensors)
각 센서의 고유 정보와 이상 온도를 판단할 임계값을 저장합니다.
```sql
CREATE TABLE sensors (
    sensor_id VARCHAR(20) PRIMARY KEY NOT NULL COMMENT '센서 고유 ID',
    location VARCHAR(50) NOT NULL COMMENT '설치 위치 (e.g., 서버랙, 냉각팬)',
    critical_temp_celsius DECIMAL(5, 2) NOT NULL COMMENT '위험 임계 온도(섭씨)'
);
```
### 온도 로그 테이블 (temperature_logs)
실제 측정된 온도 데이터를 시간 순서대로 기록합니다.
~~~sql
CREATE TABLE temperature_logs (
    log_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT '로그 고유 ID',
    sensor_id VARCHAR(20) NOT NULL COMMENT 'FK (sensors 테이블 참조)',
    temperature_celsius DECIMAL(5, 2) NOT NULL COMMENT '측정된 섭씨 온도',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '기록 시각',
    FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE
);
~~~

<br></details><br>


---

<br><details><summary> 데이터 시뮬레이션 및 이상 감지 </summary>

1. 데이터 로깅 (INSERT)

    ~~~
    -- 정상 온도 데이터 삽입
    INSERT INTO temperature_logs (sensor_id, temperature_celsius) VALUES ('SENSOR-01', 25.5);
    INSERT INTO temperature_logs (sensor_id, temperature_celsius) VALUES ('SENSOR-01', 26.1);

    -- 이상 온도 데이터 삽입 (임계값 40도 가정)
    INSERT INTO temperature_logs (sensor_id, temperature_celsius) VALUES ('SENSOR-01', 42.8); 
    ~~~


2. 이상 온도 감지 (SELECT)
    ~~~
    -- 온도가 40도 이상인 모든 위험 로그 조회
    SELECT *
    FROM temperature_logs
    WHERE temperature_celsius >= 40.0
    ORDER BY created_at DESC;
    ~~~

3.오래된 로그 삭제 (DELETE)

    ~~~
    -- 7일 이전의 모든 로그 데이터 삭제
    DELETE FROM temperature_logs
    WHERE created_at < NOW() - INTERVAL 7 DAY;

    ~~~


<br></details><br>







# 3. 학습 내용

<br><details><summary> 데이터베이스 개요 </summary>



**DB**
* 데이터베이스(database)
* 데이터들의 묶음,개념을을 뜻하는 다언


<br>

**DBMS**
* 데이터베이스 관리 시스템(database management systeam)
* 데이터&데이터 관리 도구를 모아 둔 시스템
* DBMS를 간단하게 DB라고 부른다.
* 대표적으로 MySQL,Oracle,Mongo DB 등이 존재

<br>

**DBMS 사용의 장점**
 
* 고속으로 데이터 read/write등의 알고리즘이 구현되어 제공
* 동시성,충돌 관리해주어 사용자가 동시에 데이터에 접근할 때 발생하는 충돌 문제를 해결
* 시스템 장애 발생 시 데이터를 장애 발생 이전의 상태로 복구하는 기능을 제공합니다.
* 데이터의 독립성 유지하기 때문에 논리적인 db의 데이터에만 의존한다.

<br>

**DBMS의 종류**

> ### 관계형 DB 
> - 구조 및 제약조건(스키마)를 만들어 데이터를 보관한다.
> - PK,FK를 통해 테이블간의 참조 관계를 형성한다.
> - RDBMS라고 불리며 Orcle,MySQL이 대표적.

> ### 비관계형 DB 
> - RDBMS의 구조로 데이터를 저장하지 않는 DBMS를 의미
> - 주로 json형태로 데이터를 저장하며,자유로운 형태로 데이터를 저장가능
> - mongo DB,Redis가 대표적





<br></details><br>

<br><details><summary> 데이터베이스 시스템 </summary>

**논리적 계층**
1. 인스턴스 (instance)
    - 현재 메모리에서 실행되고 있는 MySQL 서버 프로세스.데이터베이스를 관리하고 운영하는 데 필요한 모든 기능(메모리, 프로세스, 스레드 등)의 집합체

2. 스키마(schema)
    
    - 스키마는 관련된 데이터베이스 객체들(테이블, 뷰 등)의 집합. 즉, 서로 연관 있는 데이터들을 담아두는 하나의 큰 서랍장이나 컨테이너와 같습니다. MySQL에서는 SCHEMA와 DATABASE가 동일한 의미로 사용.

    - 하나의 인스턴스 안에는 여러 개의 스키마(데이터베이스)를 생성하여 목적에 따라 데이터를 분리하고 관리할 수 있습니다. (예: user_db, product_db)

3. 테이블 (table)
    - 테이블은 실제 데이터가 저장되는 기본 단위이며, 스키마 내부에 생성됩니다. 엑셀 시트처럼 행(Row)과 열(Column)로 구성된 2차원 구조를 가집니다.

**물리적 계층**

1. MySQL 엔진 (MySQL Engine Layer)
    - 이 계층은 쿼리를 해석하고 실행하는 MySQL의 두뇌 역할을 합니다. 클라이언트로부터 받은 SQL 문장을 분석하고 최적화하여 가장 효율적인 실행 계획을 세우는 핵심적인 부분입니다.

    - 연결 핸들러 (Connection Handler): 클라이언트의 접속과 통신을 관리하고, 사용자 인증 및 권한을 확인합니다.

    - SQL 파서 (SQL Parser): 사용자가 보낸 SQL 문장의 문법을 검사하고, 문장을 MySQL이 이해할 수 있는 작은 단위로 분해합니다.

    - 옵티마이저 (Optimizer): 분해된 쿼리를 어떻게 실행하는 것이 가장 빠르고 효율적일지 실행 계획을 수립합니다. 예를 들어, 어떤 순서로 테이블을 읽고 어떤 인덱스를 사용할지 결정합니다.

    - 쿼리 캐시 (Query Cache): 이전에 실행했던 쿼리와 그 결과를 메모리에 저장해두었다가, 동일한 쿼리가 다시 들어오면 데이터를 직접 읽지 않고 캐시에서 바로 결과를 반환하여 성능을 높입니다. (MySQL 8.0부터는 제거되었습니다.)

2. 스토리지 엔진 (Storage Engine Layer)
    - MySQL 엔진이 세운 실행 계획에 따라, 실제로 데이터를 디스크에 저장하거나 디스크에서 읽어오는 작업을 전담하는 계층입니다. MySQL은 '플러그인 방식'을 지원하여, 하나의 데이터베이스에서도 테이블마다 다른 종류의 스토리지 엔진을 사용할 수 있습니다.

    - InnoDB: 현재 가장 널리 사용되는 기본 스토리지 엔진입니다. 트랜잭션(Transaction)을 지원하여 데이터의 일관성과 무결성을 보장하는 데 강력하며, 높은 동시성 처리에 유리합니다.


3. 스토리지 (Storage/File System Layer)
    - 스토리지 엔진이 처리한 데이터를 실제 물리적인 파일(데이터 파일, 로그 파일 등)로 디스크에 저장하는 운영체제 수준의 계층입니다. 이 계층은 운영체제의 파일 시스템 위에서 동작하며 데이터의 영구적인 보관을 책임집니다.


<br></details><br>

<br>

<br><details><summary> CRUD </summary>

> *CRUD*는 db뿐 아니라 소프트웨어가 갖춰야할 데이터처리 동작을 의미합니다.<br>
> - C : Create  = INSERT
> - R : Read    = SELECT
> - U : Update  = UPDATE
> - D : Delete  = DELETE

<br><br>
**INSERT**
~~~
INSERT INTO 테이블명 (컬럼1, 컬럼2, ...)
VALUES (값1, 값2, ...);

EX)
INSERT INTO temperature_logs (sensor_id, temperature_celsius, created_at)
VALUES ("1번센서",10); -- pk인 id와, created_at은 설정에 따라 자동 지정
~~~

<br>

**SELECT**
~~~
SELECT 속성1, 속성2
FROM 테이블명

EX)
SELECT *  -- 모든 속성을 의미
FROM temperature_logs;
~~~

<br>

**UPDATE**
~~~
UPDATE 테이블명
SET 컬럼1 = 새로운값1, 컬럼2 = 새로운값2, ...
WHERE 조건;

EX)
UPDATE temperature_logs
SET temperature_celsius = 20
WHERE  id = 1; ~~~
~~~

<br>

**DELETE**
~~~
DELETE FROM 테이블명
WHERE 조건;

EX)
DELETE FROM temperature_logs
WHERE sensor_id ="1번센서";
~~~




<br></details><br>


<br>

<br><details><summary> JOIN </summary>



<br></details><br>


<br>

<br><details><summary> 관계정의 </summary>



<br></details><br>


<br>

<br><details><summary> 데이터 관리 </summary>

**Data Export**
~~~
mysqldump -u [사용자명] -p [데이터베이스명] > [저장할_파일명.sql]
~~~
백업,이전데이터 저장을 목적으로DB를 추출합니다.

<br>

**Data Import / Restore**
~~~
mysql -u [사용자명] -p [적용할_데이터베이스명] < [백업파일명.sql]
~~~
DB에 해당하는 파일 데이터를 적용합니다.



<br></details><br>
