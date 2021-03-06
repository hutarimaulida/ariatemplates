/*
 * Copyright 2013 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

{Template {
    $classpath:"test.aria.templates.repeater.testThree.RepeaterTestThree",
    $hasScript:false
}}
    {var myArray=[]/}
    {var myMap={}/}
    {macro main()}
        <table>
        {if data.step == 1}
            {repeater {
                // inconsistent loop type:
                loopType: "array",
                content: myMap,
                type: "TBODY",
                childSections : {
                        id: "myChildSection",
                        macro: {
                                name: "myMacro",
                                args: []
                        },

                        type: "TR"
                }
            }/}
        {elseif data.step == 2/}
            {repeater {
                // no content
                content : null,
                type: "TBODY",
                childSections : {
                        id: "myChildSection",
                        macro: {
                                name: "myMacro",
                                args: []
                        },

                        type: "TR"
                }
            }/}
        {elseif data.step == 3/}
            {repeater {
                loopType: "array",
                content: myArray,
                // macro parameter is not supported
                macro: {
                        name: "myMacro",
                        args: []
                },
                type: "TBODY",
                childSections : {
                    id: "myChildSection",
                    macro: {
                            name: "myMacro",
                            args: []
                    },

                    type: "TR"
                }
            }/}
        {elseif data.step == 4/}
            {repeater {
                loopType: "array",
                content: myArray,
                type: "TBODY",
                childSections : {
                    // missing macro parameter
                    id: "myChildSection",
                    type: "TR"
                }
            }/}
        {/if}
        </table>
    {/macro}

    {macro myMacro(item)}
    {/macro}

{/Template}
