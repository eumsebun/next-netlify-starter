
<!DOCTYPE html>
<html>

<head>
    <title>호홋어 계산기</title>
    <script>
        const TOKEN_REGEXES = [
            /^쓰미/,
            /^스미/,
            /^쓰초/,
            /^스초/,
            /^쓰/,
            /^스/,
            /^호트/,
            /^호투/,
            /^홋트/,
            /^홋투/,
            /^혹트/,
            /^혹투/,
            /^호리/,
            /^호니/,
            /^호자/,
            /^허트/,
            /^허투/,
            /^헛트/,
            /^헛투/,
            /^헉트/,
            /^헉투/,
            /^허리/,
            /^허니/,
            /^허자/,
            /^홋/,
            /^헛/,
            /^혹/,
            /^헉/,
            /^곰/,
            /^도/,
            /^노/,
            /^수/,
            /^호/,
            /^요/,
            /^코/,
            /^토/
        ];

        function scanHohotan(hohotan) {
            hohotan = hohotan.trim();

            const tokens = [];
            while (hohotan.length != 0) {
                let found = false;
                for (const tokenRegex of TOKEN_REGEXES) {
                    const match = hohotan.match(tokenRegex);
                    if (match != null) {
                        tokens.push(match[0]);
                        hohotan = hohotan.replace(tokenRegex, '');
                        found = true;

                        break;
                    }
                }

                if (!found) {
                    return null;
                }
            }

            return tokens;
        }

        function parseHohotan(hohotan) {
            const tokens = scanHohotan(hohotan);
 
            if (tokens == null) {
                throw new Error('유효하지 않은 요소가 있습니다.');
            }

            let g = 0, e = 1;
            let state = 0; //쓰스계 = 0, 쓰스파생계 = 1, 코곰계 = 2, 호토계 = 3, 홋헛계 = 4, 완료 = 5
            let sseuFlag = false, seuFlag = false;
            let hoFlag = false, toFlag = false;
            
            for (let i = 0; i < tokens.length; i++) {
                if (state == 0) {
                    if (['쓰', '스'].includes(tokens[i])) {
                        if (sseuFlag && tokens[i] == '스' || seuFlag && tokens[i] == '쓰') {
                            throw new Error('쓰스/쓰스파생계 요소에서 \'스\'와 \'쓰\'는 같이 쓰일 수 없습니다.');
                        }

                        if (tokens[i] == '쓰') sseuFlag = true;
                        else if (tokens[i] == '스') seuFlag = true;
                        
                        g += tokens[i] == '쓰' ? 1 : -1;
                    } else {
                        i--;
                        state++;
                    }
                } else if (state == 1) {
                    if (['쓰미', '스미', '쓰초', '스초'].includes(tokens[i])) {
                        if (sseuFlag && tokens[i][0] == '스' || seuFlag && tokens[i][0] == '쓰') {
                            throw new Error('쓰스/쓰스파생계 요소에서 \'스\'와 \'쓰\'는 같이 쓰일 수 없습니다.');
                        }

                        if (tokens[i][0] == '쓰') sseuFlag = true;
                        else if (tokens[i][0] == '스') seuFlag = true;

                        let valueToAdd = tokens[i][1] == '미' ? 0.5 : 1.5;
                        if (tokens[i][0] == '스') valueToAdd = -valueToAdd;
                        g += valueToAdd;
                    } else {
                        i--;
                        state++;
                    }
                } else if (state == 2) {
                    if (!['곰', '도', '노', '수', '호', '요', '코'].includes(tokens[i])) {
                        throw new Error("코곰계 요소가 예상된 자리에 잘못된 요소가 존재합니다: " + tokens[i]);
                    }

                    g += ['곰', '도', '노', '수', '호', '요', '코'].indexOf(tokens[i]) - 3;
                    state++;
                } else if (state == 3) {
                    if (['호', '토'].includes(tokens[i])) {
                        if (hoFlag && tokens[i] == '토' || toFlag && tokens[i] == '호') {
                            throw new Error('호토계 요소 \'호\'와 \'토\'는 같이 쓰일 수 없습니다.');
                        }

                        if (toFlag && tokens[i] == '토') {
                            throw new Error('호토계 요소 \'토\'는 여러 번 쓰일 수 없습니다.');
                        }

                        if (tokens[i] == '호') {
                            e += 1;
                            hoFlag = true;
                        } else if (tokens[i] == '토') {
                            e = 0;
                            toFlag = true;
                        }
                    } else {
                        i--;
                        state++;
                    }
                } else if (state == 4) {
                    if (['홋', '호트', '호투', '홋트', '홋투', '혹', '혹트', '혹투', '호리', '호니', '호자'].includes(tokens[i])) {
                        state++;
                        break;
                    } else if (['헛', '허트', '허투', '헛트', '헛투', '헉', '헉트', '헉투', '허리', '허니', '허자'].includes(tokens[i])) {
                        g = -g;
                        state++;
                        break;
                    } else {
                        throw new Error("홋헛계 요소가 예상된 자리에 잘못된 요소가 존재합니다: " + tokens[i]);
                    }
                }
            }

            if (state == 5) {
                return { g: g, e: e };                
            } else {
                throw new Error("호홋어가 불완전하게 끝났습니다.");
            }
        }

        function onInput() {
            const hohotan = document.getElementById('hohotan').value;

            if (hohotan == '') return;

            let ge;
            try {
                ge = parseHohotan(hohotan); 
            } catch (e) {
                document.getElementById('output').innerHTML = "오류: " + e.message;
                return;
            }
            
            document.getElementById('output').innerHTML = `GE(${ge.g}, ${ge.e})`;
        }

        window.onload = function() {
            onInput();
        }
    </script>
</head>
<body>
    <div style="text-align: center;">
        <input id="hohotan" type="text" oninput="onInput()">
        <p id="output" style="text-align: center;"> </p>
    </div>
</body>
</html>
