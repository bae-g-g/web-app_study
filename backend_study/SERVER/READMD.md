# 프로젝트: 센서 데이터 기반 이상 감지 및 로깅 시스템 서버 구축

> 임베디드 시스템 개발자로서 하드웨어와 직접적으로 상호작용하는 경험을 바탕으로, 데이터가 최종적으로 어떻게 수집되고 관리되는지에 대한 이해를 넓히고자 백엔드 학습을 진행했습니다. 이 문서는 학습 과정과 '센서별 맞춤형 이상 온도 감지 및 로깅 시스템' 프로젝트의 서버를 구축하며 얻은 지식을 정리한 것입니다.

# 목차

1.  **서버 기본 개념**
    -   클라이언트와 서버
    -   서버의 종류와 필요성
    -   네트워크 통신 기초
2.  **서버 구현 기술 (Node.js & Express)**
    -   JavaScript 런타임 및 프레임워크
    -   패키지 관리 (NPM)
    -   Express 핵심 기능
    -   데이터베이스 연동
3.  **API 설계 및 개발**
    -   REST API의 이해
    -   RESTful API 설계
4.  **서버 배포 및 운영**
    -   클라우드 인프라 (AWS)
    -   서버 배포와 프로세스 관리
5.  **개발 보조 도구 및 기타 기술**
    -   버전 관리 및 협업
    -   개발 및 테스트 도구
6.  **실습: 이상 온도 감지 로깅 서버 구축**
    -   프로젝트 목표
    -   데이터베이스 스키마 설계
    -   API 명세서
    -   구현 과정 및 트러블슈팅

---

# 1. 서버 기본 개념

> 가장 먼저 '서버가 무엇이고 왜 필요한지'에 대한 큰 그림을 이해하는 단계입니다.

<details><summary>클라이언트와 서버</summary>

### 클라이언트 (Client) 

* 서비스를 요청하는 주체. (예: 웹 브라우저, 모바일 앱, **임베디드 기기**)

### 서버 (Server)
* 클라이언트의 요청을 받아 처리하고, 결과를 응답하는 주체.

</details><br>

<details><summary>서버의 종류와 필요성</summary>

> 기본적으로는 요청에 대한 응답을 할 수 있는 실행 환경이 갖추어진 모든 컴퓨터가 서버가 될 수 있지만, 일반적으로 24시간 365일 안정적으로 작동하며, 수많은 동시 요청을 고성능으로 처리하고, 필요에 따라 쉽게 확장할 수 있는 기능을 할 수 있는 컴퓨터가 서버 컴퓨터로 사용됩니다.

### 서버 요구 기능

-   **중앙 집중 관리:** 데이터의 일관성과 무결성 유지.
-   **고성능 처리:** 24/7 안정적인 서비스 제공을 위한 고사양 하드웨어 및 네트워크.
-   **보안:** 방화벽, 접근 제어 등을 통한 데이터 보호.

### 서버의 종류

-   **웹 서버 (Web Server):** HTTP 요청을 받아 HTML, CSS 등 정적 콘텐츠를 제공. (예: Nginx, Apache)

-   **웹 애플리케이션 서버 (WAS, API Server):** 동적인 비즈니스 로직을 처리하고 데이터베이스와 상호작용. (예: Node.js/Express, Spring)

-   **데이터베이스 서버 (DB Server):** 데이터의 저장, 조회, 수정을 관리. (예: MySQL, PostgreSQL, MongoDB)



</details><br>

<details><summary>네트워크 통신 기초</summary>

### IP 주소
-    네트워크 상에서 기기를 식별하기 위한 고유 주소.
-   개인이 사용하는 IP는 해당 기기에 연결된 공유기의 서비스업체가 임대해준 IP를 사용하지만
    기업의 경우는 IP관리 기관에서 IP블록을 할당받아 사용하거나, 클라우드 서비스를 이용한다. 

-   `Pbulic IP` : 인터넷상에서 내컴퓨터(공유기)를 인식하기 위한 고유한 주소
-   `Private IP` : 내부 네트워크(공유기)에 연결된 기기

### PORT
-   하나의 IP 주소 내에서 특정 프로세스(애플리케이션)를 식별하기 위한 번호.
-   OS는 IP+PORT번호의 조합으로 소켓을 만들어 네트워크 통신을 허가한다.

### 프로토콜
- 각 기기간 통신의 규약을 의미한다.
- 각 계층의 프로토콜이 모두 준수되어야 유의미한 통신이 가능해진다.
- 이번 프로젝트는 웹 프로젝트인 만큼 HTTP(웹 통신 프로토콜)을 위해 라우팅/프록시 설정 및 API설계를 다룬다.

</details><br>

---

# 2. 서버 구현 기술 (Node.js & Express)
> 기본 개념을 바탕으로 실제 서버 프로그램을 만드는데 필요한 기술을 학습합니다.

<details><summary>JavaScript 런타임 및 프레임워크</summary>

-   **Node.js:** 브라우저 밖에서 JavaScript를 실행할 수 있게 해주는 런타임 환경. 이벤트 기반, 비동기 I/O 모델로 경량이고 효율적.
-   **Express.js:** Node.js를 위한 경량 웹 프레임워크. 라우팅, 미들웨어 등 웹 애플리케이션 개발에 필요한 핵심 기능 제공.
-   **Node.js로 서버 구현:** `http` 모듈을 사용해 기본적인 서버를 만들고, Express를 도입하여 구조적으로 개발.

</details><br>

<details><summary>패키지 관리 (NPM)</summary>

-   **npm (Node Package Manager):** Node.js 생태계의 라이브러리(패키지)를 관리하는 도구.
-   **package.json:** 프로젝트 정보와 의존성(dependencies)을 명시한 파일. `npm install` 명령어로 의존성 설치.
-   **전역(global) 설치 vs 지역(local) 설치:**
    -   **지역:** 프로젝트 내에서만 사용. (대부분의 경우)
    -   **전역:** 시스템 전역에서 CLI 도구처럼 사용. (예: `pm2`, `nodemon`)

</details><br>

<details><summary>Express 핵심 기능</summary>

-   **req (요청) 와 res (응답) 객체:** HTTP 요청과 응답에 대한 정보를 담고 있으며, 이를 제어하는 메서드를 제공.
-   **라우팅 (Routing):** 요청 URL 및 HTTP 메서드에 따라 다른 기능을 수행하도록 연결하는 것.
-   **미들웨어 (Middleware):** 요청과 응답 사이클 중간에 위치하여, 전/후 처리 로직을 수행하는 함수. (예: 로깅, 인증, 에러 처리)

</details><br>

<details><summary>데이터베이스 연동</summary>

-   **Node.js에서 MySQL 사용:** `mysql2` 라이브러리를 사용하여 Node.js 서버와 MySQL 데이터베이스를 연동.
-   **Query문 작성:** SQL 쿼리를 직접 작성하여 데이터를 조작. SQL Injection 공격을 방지하기 위해 Prepared Statement 사용.
-   **ORM (Object-Relational Mapping):** `Sequelize`, `TypeORM` 등. SQL 대신 객체지향 프로그래밍 언어의 코드로 데이터베이스를 조작하게 해주는 기술. 생산성 향상.
-   **고려해볼 데이터베이스:**
    -   **NoSQL (MongoDB):** 유연한 스키마가 필요할 때.
    -   **Time-Series (InfluxDB):** 센서 데이터와 같이 시간에 따라 기록되는 데이터를 효율적으로 처리하는 데 특화.

</details><br>

---

# 3. API 설계 및 개발
> 클라이언트(임베디드 기기, 웹)와 서버가 데이터를 주고받는 규칙(API)을 설계하고 개발하는 단계입니다.

<details><summary>REST API의 이해</summary>

-   **REST (Representational State Transfer):** 웹의 장점을 최대한 활용할 수 있는 아키텍처 스타일.
-   **구성 요소:** 자원(Resource), 행위(Verb), 표현(Representations).
-   **특징:** 균일한 인터페이스, 무상태성(Stateless), 캐시 가능성 등.

</details><br>

<details><summary>RESTful API 설계</summary>

-   **자원 (Resource):** URI는 리소스를 표현해야 함. (명사 사용)
    -   `GET /sensors/1` (O)
    -   `GET /getSensorById/1` (X)
-   **행위 (Verb):** HTTP Method(동사)로 행위를 표현.
    -   **GET:** 데이터 조회
    -   **POST:** 데이터 생성
    -   **PUT/PATCH:** 데이터 수정
    -   **DELETE:** 데이터 삭제
-   **데이터 포맷:** 주로 JSON(JavaScript Object Notation)을 사용.
-   **응답 상태 코드 (Response Status Code):** 요청의 처리 결과를 명확하게 전달.
    -   `2xx` (성공): `200 OK`, `201 Created`
    -   `4xx` (클라이언트 오류): `400 Bad Request`, `404 Not Found`
    -   `5xx` (서버 오류): `500 Internal Server Error`

</details><br>

---

# 4. 서버 배포 및 운영
> 내가 만든 서버를 인터넷 세상 어디에서나 접근할 수 있도록 배포하고 운영하는 단계입니다.

<details><summary>클라우드 인프라</summary>

##  클라우드 컴퓨팅

* 인터넷을 통해 IT 자원(서버, 스토리지, 소프트웨어 등)을 빌려 쓰고, 사용한 만큼만 돈을 내는서비스.
    
* 개발, 유지보수,안정성등이 개인 혹은 소규모 집단이 관리하는 것보다 훨씬 유리하기 때문에 이러한 클라우드 컴퓨팅 서비스를 이용한다. 

* 대표적으로 AWS(Amazon Web Service), Microsoft Azure, Google Cloud 등이 있으며
이번 프로젝트에서 AWS를 사용한다.


## 클라우드 서비스 종류

### IaaS (Infrastructure as a Service) 서비스형 인프라
- 서버,스토리지,네트워크등  기본적인 인프라만 제공받습니다.
- 사용자는 직접 OS부터 설치하여 배포를 위해 필요한 모든 환경을 설정해야합니다.
- 대표적으로 AWS EC2가 있습니다.

### PaaS (Platform as a Service) 서비스형 플랫폼
- IaaS에 OS,DB,웹서버등 서비스 배포에 필요한 플랫폼을 제공받는다.
- 개발자는 자신의 코드만 올려 서비스를 배포하는거이 가능해집니다.
- 대표적으로 Heroku, Google App Engine


## EC2

> EC2는 Elastic Compute Cloud로 IaaS 서비스를 제공합니다.<br>
> 간단히 말하면, 인터넷으로 빌려서 사용 가능한 가상의 컴퓨터입니다.

## 장점
- 하드웨어 제약 : 실제 컴퓨터에서 서버운영에 고려해야항 하드웨어적 문제가(유지,보수,성능) 해결됩니다.
  
- 빠른 속도 : 개발과정에서 간단한 서버를 필요로 하거나, 빌드 시간이 오래 걸리는 작업을 필요로 할 때
인스턴스를 생성하여 빠르게 필요한 업무를 처리 할 수 있습니다.

- 비용 : 사용한 만큼의 비용만 지불하며 초기,매몰비용이 존재하지 않습니다.

## EC2 용어
- 인스턴스 : 가상의 캄퓨터(보드)를 의미하면 사용자의 필요에따라(Elastic) 컴퓨터의
스펙을 조절 가능합니다.

- AMI(amazon Machin Image) : os의 이미지 파일입니다. 필요한 os버전, 개발환경등 또한 설정하여
 인스턴스에 적용 할 수 있습니다.

- EBS(Elastic Block Stroe) : 실제 컴퓨터의 디스크 저장장치와 같은 인스턴스의 저장장치로 필요에 따라 동적으로 조절이 가능합니다.

- 보안그룹 : 인스턴스에 설정된 방화벽입니다. 인스턴스를 통해 서버에 접속하거나 ssh연결이 필요 할 경우 보안그룹에서 설정하여 허용된 접근만 가능하도록 설정이 가능합니다.  


</details><br>

<details><summary>서버 배포와 프로세스 관리</summary>

-   **Nginx:** 고성능 웹 서버. 정적 파일 서빙, 리버스 프록시, 로드 밸런싱 등의 기능으로 API 서버의 부담을 줄여줌.
## Nginx

-   **API 서버 배포:** EC2 인스턴스에 소스 코드를 배포하고, `npm install`로 의존성을 설치한 후 서버 실행.
-   **프로세스 관리자 (PM2):** Node.js 애플리케이션을 위한 프로세스 관리 도구. 서버가 예기치 않게 종료되었을 때 자동으로 재시작해주고, 클러스터 모드를 통해 성능을 향상.


</details><br>

---

# 5. 개발 보조 도구 및 기타 기술
> 코딩, 테스트, 통신 등 개발 전반의 효율을 높여주는 도구들입니다.

<details><summary>버전 관리 및 협업</summary>

-   **Git & GitHub:** 코드의 변경 이력을 관리하고, 협업을 위한 필수 도구.

</details><br>

<details><summary>개발 및 테스트 도구</summary>

## VSCODE Remote - SSH


-   **nodemon:** 소스 코드 변경 시 자동으로 서버를 재시작.
-   **morgan:** HTTP 요청에 대한 로그를 기록하는 미들웨어.
-   **dotenv:** 환경 변수(`.env` 파일)를 관리. DB 접속 정보 등 민감한 정보를 코드와 분리.
-   **Postman:** API를 개발하고 테스트하기 위한 GUI 도구.
-   **axios:** 브라우저와 Node.js에서 사용할 수 있는 HTTP 통신 라이브러리.

</details><br>

---

# 6. 실습: 이상 온도 감지 로깅 서버 구축

<details><summary>프로젝트 목표</summary>

-   다양한 센서(온도, 습도 등)로부터 주기적으로 데이터를 수신.
-   설정된 임계값을 초과하는 '이상 데이터'를 감지하고 별도로 로깅.
-   수집된 데이터를 조회하고, 이상 데이터를 필터링할 수 있는 API 제공.

</details><br>

<details><summary>데이터베이스 스키마 설계</summary>

-   **sensors 테이블:** 센서의 정보를 관리 (id, type, location 등).
-   **sensor_logs 테이블:** 모든 센서 데이터를 기록 (id, sensor_id, value, timestamp).
-   **anomaly_logs 테이블:** 이상 감지된 데이터를 기록 (id, log_id, detected_at).

</details><br>

<details><summary>API 명세서</summary>

-   `POST /logs`: 센서로부터 데이터를 받아 저장.
-   `GET /logs`: 전체 센서 로그 조회 (필터링: 센서 ID, 기간).
-   `GET /logs/anomaly`: 이상 감지된 로그만 조회.
-   `POST /sensors`: 새로운 센서 등록.
-   `GET /sensors`: 등록된 센서 목록 조회.

</details><br>

<details><summary>구현 과정 및 트러블슈팅</summary>

-   **초기 구현:** Express 라우터 중심으로 기능 구현.
-   **리팩토링:** 서비스 계층을 도입하여 비즈니스 로직과 라우터를 분리.
-   **트러블슈팅:**
    -   **Timezone 문제:** DB에 저장되는 시간과 한국 시간의 불일치 문제. 서버와 DB의 타임존 설정을 통일하여 해결.
    -   **대용량 요청 처리:** 다수의 센서가 동시에 요청을 보낼 경우를 대비하여, PM2 클러스터 모드를 적용하고 Nginx를 리버스 프록시로 설정하여 부하 분산.

</details><br>