if (!DocCommon) {
    var DocCommon = function () {

        const speed = 350; // default ani. speed
        let popIndex = 100, // z-index between layer popups
        focusMove = '<a href="#" class="pop-loop">포커스이동</a><div class="dimmed" aria-hidden="true"></div>';

        var init = function () {
            jsonSet.init();
            setTimeout(function(){
                status.init();
                tableBoard.init();
            },100);
            menuToggle.init();
            navScroll.init();
            debounce();
        };

        var jsonSet = {
            init: function () {
                jsonSet.base();
            },
            base: function () {
                document.querySelectorAll('.board-list').forEach(list => {
                    // 활성화된 탭 설정
                    list.querySelectorAll('.active [role=tab]').forEach(activeTab => {
                        const link = activeTab.getAttribute('data-json');
                        if (!link) return;
        
                        activeTab.setAttribute('title', '선택됨');
                        activeTab.removeAttribute('tabindex');
                        activeTab.setAttribute('aria-selected', 'true');
        
                        jsonSet.fetchData(link);
                    });
        
                    // 비활성화된 탭 설정
                    list.querySelectorAll('.item:not(.active) [role=tab]').forEach(inactiveTab => {
                        inactiveTab.setAttribute('tabindex', '-1');
                        inactiveTab.removeAttribute('title');
                        inactiveTab.setAttribute('aria-selected', 'false');
                    });
        
                    // 클릭 이벤트 리스너 추가
                    list.addEventListener('click', function (e) {
                        const target = e.target.closest('[role=tab]');
                        if (!target) return;
        
                        e.preventDefault();
        
                        const link = target.getAttribute('data-json');
                        if (!link) return;
        
                        const item = target.closest('.item');
                        if (!item || item.classList.contains('active')) return;
        
                        // 기존 활성화된 탭 초기화
                        list.querySelectorAll('.item [role=tab]').forEach(tab => {
                            const tabItem = tab.closest('.item');
                            if (tabItem) tabItem.classList.remove('active');
        
                            tab.removeAttribute('title');
                            tab.setAttribute('tabindex', '-1');
                            tab.setAttribute('aria-selected', 'false');
                        });
        
                        // 새로 클릭된 탭 활성화
                        item.classList.add('active');
                        target.removeAttribute('tabindex');
                        target.setAttribute('title', '선택됨');
                        target.setAttribute('aria-selected', 'true');
        
                        jsonSet.tablePanel();
                        
                        // 새로운 데이터 요청
                        //jsonSet.fetchData(link);
                    });

                    boardtTab = new Swiper(".board-tab-wrap.swiper", {
                        slidesPerView: "auto",
                        spaceBetween:8,
                    });
                });
            },
            fetchData: function (link) {
                if (!link) return;
                
                fetch(link)
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
                        return response.json();
                    })
                    .then(data => jsonSet.jsonfunc(data))
                    .catch(error => console.error("데이터 로드 실패:", error));
            },
            jsonfunc: function (data) {
                let item = document.querySelectorAll('.board-list .swiper-slide');
                let itemLength = item.length;
                let LoadCount = 0;

                let htmlBoard = function(tableid, dataHtml){
                    var html = '<div id="' + `${tableid}` + '" class="tbl-wrap tbl-data">';
                    html += '<table>';
                    html += '<caption>메뉴별 코딩리스트</caption>';
                    html += '<colgroup>';
                    html += '<col style="width:50px">';
                    html += '<col style="width:150px">';
                    html += '<col style="width:90px">';
                    html += '<col class="d1" style="width:auto">';
                    html += '<col class="d2" style="width:auto">';
                    html += '<col class="d3" style="width:auto">';
                    html += '<col class="d4" style="width:auto">';
                    html += '<col style="width:300px">';
                    html += '<col style="width:90px">';
                    html += '<col style="width:100px">';
                    html += '<col style="width:100px">';
                    html += '<col style="width:100px">';
                    html += '<col style="width:80px">';
                    html += '<col style="width:100px">';
                    html += '</colgroup>';
                    html += '<thead>';
                    html += '<tr>';
                    html += '<th scope="col">No</th>';
                    html += '<th scope="col" class="id">화면id</th>';
                    html += '<th scope="col" class="type">화면타입</th>';
                    html += '<th scope="col" class="deps d1">1Depth</th>';
                    html += '<th scope="col" class="deps d2">2Depth</th>';
                    html += '<th scope="col" class="deps d3">3Depth</th>';
                    html += '<th scope="col" class="deps d4">4Depth</th>';
                    html += '<th scope="col" class="name">화면명</th>';
                    html += '<th scope="col" class="worker">';
                    html += '<select>';
                    html += '<option value="">작업자</option>';
                    html += '</select>';
                    html += '</th>';
                    html += '<th scope="col" class="s-date">';
                    html += '<select>';
                    html += '<option value="">작업 시작일</option>';
                    html += '</select>';
                    html += '</th>';
                    html += '<th scope="col" class="e-date">';
                    html += '<select>';
                    html += '<option value="">작업 완료일</option>';
                    html += '</select>';
                    html += '</th>';
                    html += '<th scope="col" class="m-date">';
                    html += '<select>';
                    html += '<option value="">수정일</option>';
                    html += '</select>';
                    html += '</th>';
                    html += '<th scope="col" class="complete">상태</th>';
                    html += '<th scope="col" class="etc">비고</th>';
                    html += '</tr>';
                    html += '</thead>';
                    html += '<tbody>';
                    html += `${dataHtml}`;
                    html += '</tbody>';
                    html += '</table>';
                    html += '</div>';
                    document.querySelector('.g-contents').insertAdjacentHTML('beforeend', html);
                }

                let htmlTbody = function(data){
                    let tbodyHtml = '';
                    let idx = 1;
                    let urlLink = '';

                    let createTr = function (obj) {
                        let trHtml = '';

                        if (obj.directory !== undefined && obj.directory !== '') {
                            urlLink = obj.directory;
                        }else{
                            trHtml += `<tr class="${obj.state || ''}">`;
                            trHtml += `<td class="no">${idx++}</td>`;
                
                            if (obj.id) {
                                if (obj.link) {
                                    trHtml += `<td class="id">${obj.id}</td>`;
                                } else {
                                    trHtml += `<td class="id"><a href="${urlLink}/${obj.id}.html" target="_blank">${obj.id}</a></td>`;
                                }
                            } else {
                                trHtml += `<td class="id"></td>`;
                            }
                
                            trHtml += `<td class="type"><span>${obj.type || '본창'}</span></td>`;
                            trHtml += `<td class="depth1">${obj.depth1 || ''}</td>`;
                            trHtml += `<td class="depth2">${obj.depth2 || ''}</td>`;
                            trHtml += `<td class="depth3">${obj.depth3 || ''}</td>`;
                            trHtml += `<td class="depth4">${obj.depth4 || ''}</td>`;
                            trHtml += `<td class="name">${obj.name || ''}</td>`;
                            trHtml += `<td class="worker">${obj.worker || ''}</td>`;
                            trHtml += `<td class="s-date">${obj.workStartdate || ''}</td>`;
                            trHtml += `<td class="e-date">${obj.workEndDate || ''}</td>`;
                            trHtml += `<td class="m-date">${obj.change || ''}</td>`;
                
                            let completeClass = '대기중';
                            if (obj.complete && !obj.state) completeClass = `<span class="done">${obj.complete}</span>`;
                            else if (obj.state === 'del') completeClass = '<span class="del">삭제</span>';
                            else if (obj.state === 'hold') completeClass = '<span class="hold">보류</span>';
                            else if (obj.state === 'working') completeClass = '<span class="working">작업중</span>';
                            else if (obj.workEndDate) completeClass = '<span class="ing">확인요청</span>';
                
                            trHtml += `<td class="complete">${completeClass}</td>`;
                
                            if (obj.etc) {
                                let remark = obj.etc.map(item => {
                                    if (item.includes('디자인확인')) return `<li class="design">${item}</li>`;
                                    if (item.includes('기획확인')) return `<li class="plan">${item}</li>`;
                                    return `<li>${item}</li>`;
                                }).join('');
                
                                trHtml += `<td class="etc"><ul class="remark">${remark}</ul><a href="${urlLink}/${obj.id}.html" class="btn-hover" target="_blank">${obj.id}</a></td>`;
                            } else {
                                trHtml += `<td class="etc"><a href="${urlLink}/${obj.id}.html" class="btn-hover" target="_blank">${obj.id}</a></td>`;
                            }
                        }
            
                        trHtml += '</tr>';
                        return trHtml;
                    };
            
                    data.forEach(item => {
                        tbodyHtml += createTr(item);
                    });
            
                    return tbodyHtml;
                }

                item.forEach((slide, i) => {
                    var rel = 'panel' + i;
                    slide.setAttribute('rel', rel);
        
                    setTimeout(function(){
                        jsonSet.tablePanel();
                    },100);

                    var jsonUrl = slide.querySelector('button')?.dataset.json;
                    if (!jsonUrl) return;
        
                    fetch(jsonUrl)
                        .then(response => {
                            if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
                            return response.json();
                        })
                        .then(data => {
                            let dataHtml = htmlTbody(data);
                            htmlBoard(rel, dataHtml);
                            LoadCount += 1;
        
                            if (LoadCount === itemLength) {
                                setTimeout(() => {
                                    setTimeout(() => {
                                        window.dispatchEvent(new Event('resize'));
                                    }, 100);
                                }, 100);
                            }
                        })
                        .catch(error => {
                            console.error(rel, '에러 발생:', error);
                        });
                });
            },
            tablePanel: function(){
                let activeElement = document.querySelector('.board-list .active');
                if (activeElement) {
                    let target = activeElement.getAttribute('rel');
                    
                    if (target) {
                        let targetElement = document.querySelector('#' + target);
                        if (targetElement) {
                            let container = targetElement.closest('.g-contents');

                            if (container) {
                                container.querySelectorAll('.tbl-wrap.tbl-data').forEach(panel => {
                                    panel.classList.remove('active');
                                });
                            }

                            targetElement.classList.add('active');
                        }
                    }
                }
            }
        };

        var status = {
            init:function(){
                status.push();
            },
            push:function(){
                document.querySelectorAll('.tbl-wrap.tbl-data tbody .s-date').forEach(function(el) {
                    if(el.innerHTML.trim() !== '' || el.closest('tbody').querySelector('.done')){
                        el.closest('tr').classList.add('working');
                    }
                });

                document.querySelectorAll('.tbl-wrap.tbl-data').forEach(function() {
                    //페이지 총 본수
                    var pageNum = function () {
                        var length = 0;
                        document.querySelectorAll('table .no').forEach(function(){
                            length += 1;
                        });
                        return length;
                    };

                    //삭제된 본수
                    var delNum = function(){
                        var length = 0;
                        document.querySelectorAll('table tr.del').forEach(function(){
                            length += 1;
                        });
                        return length;
                    };

                    //진행 본수
                    var workingNum = function(){
                        var length = 0;
                        document.querySelectorAll('table .working').forEach(function(){
                            length += 1;
                        });
                        return length;
                    };
                    
                    //완료 된 본수
                    var completeNum = function () {
                        var length = 0;

                        document.querySelectorAll('tbody tr td.complete span').forEach(function(el) {
                            if (!el.classList.contains('del') && el.textContent.trim() === '완료') {
                                length += 1;
                            }
                        });
                        return length;
                    };
                    var per = pageNum() === 0 ? 0 : Math.round((100 / pageNum()) * completeNum());
                    if (per === 100) Math.floor((100 / pageNum()) * completeNum());

                    document.querySelector('.status-area .status .t-num').textContent = pageNum();
                    document.querySelector('.status-area .status .w-num').textContent = workingNum() - delNum();
                    //document.querySelector('.status-area .status .d-num').textContent = delNum();
                    document.querySelector('.status-area .status .c-num').textContent = completeNum();
                    document.querySelector('.status-area .status .graph .text').textContent = '진행률 : '+per+'%';
                    document.querySelector('.status-area .status .graph .bar').style.width = per+'%';
                });
            }
        };

        var tableBoard = {
            init:function(){
                tableBoard.push();
                tableBoard.change();
                tableBoard.state();
                tableBoard.search('.inp-sch');
                tableBoard.remark();
            },
            push: function () {
                const resetSelect = (selectElement, values) => {
                    if (selectElement) {
                        if(selectElement.closest('.worker')){
                            selectElement.innerHTML = '<option value="">작업자</option>';
                        }else if(selectElement.closest('.s-date')){
                            selectElement.innerHTML = '<option value="">시작일</option>';
                        }else if(selectElement.closest('.e-date')){
                            selectElement.innerHTML = '<option value="">종료일</option>';
                        }else if(selectElement.closest('.m-date')){
                            selectElement.innerHTML = '<option value="">수정일</option>';
                        }
                        
                        values.forEach(value => {
                            const option = document.createElement('option');
                            option.value = value;
                            option.textContent = value;
                            selectElement.appendChild(option);
                        });
                    }
                };
                
        
                const getValue = (tbody, selector, prefix = "") => {
                    const values = [];
                    tbody.querySelectorAll(selector).forEach(td => {
                        let text = td.textContent.trim();
                        if (text) {
                            let numericValue = Number(text.replace(/\//g, ''));
                            let className = prefix ? `${prefix}-${numericValue}` : numericValue;
                            td.closest('tr').classList.add(className);
                            if (!values.includes(numericValue)) {
                                values.push(numericValue);
                            }
                        }
                    });
                    return values.sort((a, b) => a - b);
                };
        
                document.querySelectorAll('.tbl-wrap.tbl-data').forEach(tableWrap => {
                    const tbody = tableWrap.querySelector('tbody');
                    const thead = tableWrap.querySelector('thead');

                    if (tbody && thead) {
                        resetSelect(thead.querySelector('.s-date select'), getValue(tbody, 'td.s-date', 's'));
                        resetSelect(thead.querySelector('.e-date select'), getValue(tbody, 'td.e-date', 'e'));
                        resetSelect(thead.querySelector('.m-date select'), getValue(tbody, 'td.m-date', 'm'));

                        // 작업자 필터 처리
                        const workerMap = {
                            "퍼블1": "pub1",
                            "퍼블2": "pub2",
                            "퍼블3": "pub3",
                            "퍼블4": "pub4",
                        };

                        const workerValues = [];
                        tbody.querySelectorAll('td.worker').forEach(td => {
                            let text = td.textContent.trim();
                            if (text) {
                                let className = workerMap[text] || text;
                                td.closest('tr').classList.add(className);
                                if (!workerValues.includes(text)) {
                                    workerValues.push(text);
                                }
                            }
                        });
                
                        workerValues.sort((a, b) => a.localeCompare(b));
                        resetSelect(thead.querySelector('.worker select'), workerValues);
                    }
                });
            },
            change: function(){
                document.querySelectorAll('.tbl-wrap.tbl-data').forEach(tableWrap => {
                    tableWrap.querySelectorAll('thead th select').forEach(function(select) {
                        select.addEventListener('change', function() {
                            var parent = select.closest('thead'); // 가장 가까운 thead 요소 찾기
                            var tbody = select.closest('.tbl-wrap.tbl-data').querySelector('tbody');
    
                            // 입력 값 가져오기
                            const getVal = (cls) => parent.querySelector(cls)?.value?.trim() || "";
                            const sVal = getVal('.s-date select');
                            const eVal = getVal('.e-date select');
                            const mVal = getVal('.m-date select');
                            let wVal = getVal('.worker select');
    
                            // 작업자 매핑 (Switch 대신 객체 활용)
                            const workerMap = {
                                '작업자': '',
                                '퍼블1': 'pub1',
                                '퍼블2': 'pub2',
                                '퍼블3': 'pub3',
                                '퍼블4': 'pub4'
                            };
                            wVal = workerMap[wVal] || wVal;
    
                            const showRows = (selector) => tbody.querySelectorAll(selector).forEach(tr => tr.style.display = '');
        
                            // 모든 값이 비어있을 때 → 스타일 제거
                            if (!sVal && !eVal && !mVal && !wVal) {
                                tbody.querySelectorAll('tr').forEach(tr => tr.removeAttribute('style'));
    
                            // 모든 값이 존재할 때 → 조건에 맞는 요소만 표시
                            } else if (sVal && eVal && mVal && wVal) {
                                tbody.querySelectorAll('tr:not(.hr)').forEach(tr => tr.style.display = 'none');
                                showRows(`.s-${sVal}.e-${eVal}.m-${mVal}.${wVal}`);
    
                            // 일부 값만 있을 때 → 각각 필터링
                            } else {
                                tbody.querySelectorAll('tr:not(.hr)').forEach(tr => tr.style.display = 'none');
                                if (sVal) showRows(`.s-${sVal}`);
                                if (eVal) showRows(`.e-${eVal}`);
                                if (mVal) showRows(`.m-${mVal}`);
                                if (wVal) showRows(`.${wVal}`);
                            }
                        });
                    });
                });
            },
            state: function(){
                document.querySelectorAll('.tbl-wrap.tbl-data tbody .s-date').forEach(function(el){
                    if(el.innerHTML.trim() !== '' || el.closest('tbody').querySelectorAll('.done').length > 0){
                        el.parentElement.classList.add('working');
                    }
                });
                document.querySelectorAll('.tbl-wrap.tbl-data tbody .e-date').forEach(function(el){
                    if(el.innerHTML.trim() !== '' || el.closest('tbody').querySelectorAll('.done').length > 0){
                        el.parentElement.classList.add('end');
                    }
                });
                document.querySelectorAll('.tbl-wrap.tbl-data tbody .m-date').forEach(function(el){
                    if(el.innerHTML.trim() !== '' && !el.parentElement.classList.contains('del')){
                        el.parentElement.classList.add('modify');
                    }
                });
            },
            search:function(target){
                ['keyup', 'focusin'].forEach(function(eventType){
                    document.addEventListener(eventType, function(event){
                        if (!event.target.matches(target)) return;

                        const input = event.target;
                        const value = input.value;
                        const body = document.querySelector('body');
                        const schWrap = input.closest('.sch-wrap');
                        let delBtn = schWrap.querySelector('.btn-sch-del');

                        //input의 value값이 빈값이 아닐때
                        if(value !== ''){
                            
                            //삭제 버튼이 없을 경우 추가
                            if(!delBtn){
                                delBtn = document.createElement('button');
                                delBtn.innerHTML = '<span class="hidden">입력 내용 삭제</span>';
                                delBtn.classList.add('btn-sch-del');

                                // 삭제 버튼 클릭 시 input 초기화
                                delBtn.addEventListener('click', function () {
                                    input.value = '';
                                    input.focus();
                                    delBtn.remove();

                                    DocCommon.removeHighlight(body);

                                    document.querySelectorAll('tbody tr').forEach(tr => tr.removeAttribute('style'));
                                });

                                input.after(delBtn);
                            }

                            DocCommon.removeHighlight(body);

                            //input에 내용이 입력될때 체크
                            if(value){
                                DocCommon.highlight(body, value);
                                
                                document.querySelectorAll('tbody').forEach(tbody => {
                                    tbody.querySelectorAll('tr').forEach(tr => {
                                        tr.style.display = 'none';
                                    });
                                });

                                document.querySelectorAll('.highlight').forEach(text => {
                                    text.closest('tr').removeAttribute('style');
                                });
                            }
                        }else{
                            //value값이 없을 때 삭제 버튼이 있는지 확인 후 삭제
                            delBtn?.remove();

                            DocCommon.removeHighlight(body);

                            document.querySelectorAll('tbody').forEach(tbody => {
                                tbody.querySelectorAll('tr').forEach(tr => {
                                    tr.removeAttribute('style');
                                });
                            });
                        }
                    });
                });

                // .sch-wrap 전체에서 focusout 감지해서 버튼 제거
                document.querySelectorAll('.sch-wrap').forEach(schWrap => {
                    schWrap.addEventListener('focusout', function (e) {
                        // focus 빠진 후 150ms 뒤 현재 포커스 요소 확인
                        setTimeout(() => {
                            const activeEl = document.activeElement;
                            if (!schWrap.contains(activeEl)) {
                                const delBtn = schWrap.querySelector('.btn-sch-del');
                                delBtn?.remove();
                            }
                        }, 150);
                    });
                });
            },
            remark:function(){
                document.querySelectorAll('.remark').forEach(el =>{
                    el.addEventListener('click', function(){
                        const clone = el.cloneNode(true);
                        const remarkPop = document.createElement('div');
                        remarkPop.className = 'remark-pop';
                        remarkPop.innerHTML = '<h2>History</h2><div class="history"></div>';

                        const dimmed = document.createElement('div');
                        dimmed.className = 'dimmed';

                        document.body.appendChild(remarkPop);
                        document.body.appendChild(dimmed);

                        document.querySelector('.remark-pop .history').appendChild(clone);
                    });
                });

                document.body.addEventListener('click', function(e) {
                    if (e.target.classList.contains('dimmed')) {
                        const pop = document.querySelector('.remark-pop');
                        if (pop) pop.remove(); // 팝업이 있을 경우 삭제
                        e.target.remove(); // .dimmed 삭제
                    }
                });
            }
        };

        function highlight(element, pat) {
            if (!element || !pat) return; // 요소나 검색어가 없으면 종료

            // 기존 하이라이트 제거
            element.querySelectorAll('.highlight').forEach(span => {
                span.replaceWith(...span.childNodes); // <span> 제거, 내용만 남김
            });

            function innerHighlight(node, pat){
                let skip = 0;
                if(node.nodeType === 3){ //텍스트 노드
                    var pos = node.data.toUpperCase().indexOf(pat); //대소문자 구분 없이
                    if(pos >= 0){
                        var span = document.createElement('span');
                        span.className = 'highlight';
                        var middlebit = node.splitText(pos); //검색어의 시작 위치를 찾아서 텍스트 분리
                        var endbit = middlebit.splitText(pat.length); //검색어 길이만큼 다시 분리
                        var middleclone = middlebit.cloneNode(true);
                        
                        span.appendChild(middleclone);
                        middlebit.parentNode.replaceChild(span,middlebit);
                        skip = 1; //하이라이트 적용 후 skip = 1;
                    }
                }else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        i += innerHighlight(node.childNodes[i], pat);  // skip 값을 더함
                    }
                }
        
                return skip;  // 이미 처리된 노드를 건너뛸 수 있도록 반환
            }

            if (element) {
                innerHighlight(element, pat.toUpperCase());
            }
        };

        function removeHighlight(element) {

            //연속된 텍스트 노드들을 하나로 합침
            function newNormalize(node) {
                let children = node.childNodes;

                for (let i = 0; i < children.length; i++) {
                    let child = children[i];

                    if (child.nodeType === 1) {  // element 요소 노드
                        newNormalize(child);
                        continue;
                    }
                    if (child.nodeType !== 3) continue; // 텍스트 노드가 아니면 무시

                    let next = child.nextSibling;
                    if (!next || next.nodeType !== 3) continue; // 다음 노드가 없거나 텍스트 노드가 아니면 무시

                    let combinedText = child.nodeValue + next.nodeValue;

                    let newNode = document.createTextNode(combinedText);
                    node.insertBefore(newNode, child);
                    node.removeChild(child);
                    node.removeChild(next);

                    i--; // 리스트 변경되었으므로 인덱스 조정
                }
            }

            // span.highlight을 찾아서 새로운 텍스트노드(document.createTextNode(span.textContent)로 대체
            let highlights = element.querySelectorAll("span.highlight");
            highlights.forEach((span) => {
                let parent = span.parentNode;
                if (parent) {
                    parent.replaceChild(document.createTextNode(span.textContent), span);
                    newNormalize(parent);
                }
            });
        };

        var menuToggle = {
            init: function(){
                menuToggle.action();
            },
            action:function(){
                const btn = document.querySelector('.btn-menu');
                const tabList = document.querySelector('.tab-list');

                btn.addEventListener('click', function(){
                    if(btn.classList.contains('on')){
                        btn.classList.remove('on');
                        tabList.classList.remove('on');
                    }else{
                        btn.classList.add('on');
                        tabList.classList.add('on');
                    }
                });
            }
        };

        var navScroll = {
            scrolling: false,

            init:function(){
                navScroll.active();
                navScroll.scroll();
            },
            active: function () {
                const items = document.querySelectorAll('.nav-list ul li');
        
                items.forEach((item) => {
                    const buttons = item.querySelector('a');
                    buttons.addEventListener('click', (e) => {
                        e.preventDefault();

                        document.querySelectorAll('.nav-list ul li').forEach(s => s.classList.remove('on'));
                        buttons.closest('li').classList.add('on');
                        
                        const targetId = buttons.getAttribute('href');
                        const targetSection = document.querySelector(targetId);
                        const spaceHeight = document.querySelector('.nav').offsetHeight + 20;

                        if (targetSection) {
                            const top = targetSection.offsetTop;
                    
                            window.scrollTo({
                                top: top - spaceHeight,
                                behavior: 'auto'
                            });
                        }

                        navScroll.move();
                    });
                });
            },
            scroll: function () {
                window.addEventListener('scroll', () => {
                    if (this.scrolling) return;
        
                    this.scrolling = true;
        
                    requestAnimationFrame(() => {
                        const scrollY = window.scrollY || document.documentElement.scrollTop;
                        const buttons = document.querySelectorAll('.nav-list ul li a');
                        const items = document.querySelectorAll('.section');
                        let activeIndex = -1;
        
                        
                        
                        items.forEach((section, index) => {
                            const sectionTop = section.getBoundingClientRect().top + scrollY;
                            const sectionHeight = section.offsetHeight;
                            const middleOffset = window.innerHeight / 2;
        
                            if (scrollY >= sectionTop - middleOffset && scrollY < sectionTop + sectionHeight - middleOffset) {
                                activeIndex = index;
                            }
                        });
        
                        // 버튼 상태 변경
                        buttons.forEach((btn, index) => {
                            const li = btn.closest('li');
                            if (index === activeIndex) {
                                li.classList.add('on');
                                navScroll.move();
                            } else {
                                li.classList.remove('on');
                            }
                        });

                        this.scrolling = false;
                    });
                });
            },
            move: function(){
                const wrapper = document.querySelector('.nav-list ul');
                const itemLeft = wrapper.querySelector('.nav-list ul .on').offsetLeft;

                wrapper.scrollTo({
                    left: itemLeft - 10,
                    behavior: 'smooth'
                });
            }
        };

        function debounce(func, wait) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (typeof func === 'function') {
                        func.apply(this, args);
                    }
                }, wait);
            };
        }

        return {
            init,
            jsonSet,
            status,
            tableBoard,
            highlight,
            removeHighlight,
            menuToggle,
            navScroll,
            debounce
        }
    };

    window.DocCommon = DocCommon();

    window.onload = function () {
        DocCommon.navScroll.init();

        try{
            setTimeout(function(){
                window.DocCommon.init();
            },100);
        }catch(err){
            console.log(err);
        }
    };
}