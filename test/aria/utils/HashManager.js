/*
 * Copyright 2012 Amadeus s.a.s.
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

/**
 * Test case for aria.utils.HashManager
 */
Aria.classDefinition({
    $classpath : "test.aria.utils.HashManager",
    $extends : "aria.jsunit.TestCase",
    $dependencies : ["aria.utils.HashManager"],
    $constructor : function () {
        this.$TestCase.constructor.call(this);
        this.__callbackCount = {};
        this.hm = aria.utils.HashManager;
    },
    $destructor : function () {
        this.hm = null;
        this.__callbackCount = null;
        this.$TestCase.$destructor.call(this);
    },
    $prototype : {
        setUp : function () {
            var window = Aria.$window;
            this.__initialHash = window.location.hash;
            window.location.hash = "";
            this.hm._currentHashString = this.hm.getHashString();
        },

        tearDown : function () {
            var window = Aria.$window;
            window.location.hash = this.__initialHash;
            this.hm._currentHashString = this.hm.getHashString();
        },

        myNotifyTestEnd : function (test) {
            var window = Aria.$window;
            window.location.hash = "";
            this.notifyTestEnd(test);
        },

        testValidateHashObject : function () {
            var hm = this.hm;

            this.assertFalse(hm._validateHashObject({
                first : {
                    wrong : "wrong"
                }
            }));
            this.assertErrorInLogs(hm.INVALID_HASHOBJECT_TYPE);

            hm.setSeparators(',');

            this.assertTrue(hm._validateHashObject({
                first : "valid",
                second : "inva,lid"
            }));

            hm.addSeparators('&');

            this.assertTrue(hm._validateHashObject({
                first : "valid",
                second : "inva&lid"
            }));

            hm.setSeparators("ab");
            this.assertFalse(hm._validateHashObject({
                first : "valid",
                second : "invablid"
            }));
            this.assertErrorInLogs(hm.INVALID_HASHOBJECT_VALUE);
            this.assertFalse(hm._validateHashObject({
                first : "valid",
                sabond : "invalid"
            }));
            this.assertErrorInLogs(hm.INVALID_HASHOBJECT_KEY);
        },

        testBuildRegexpFromArray : function () {
            var re = this.hm.__buildRegExpFromArray(["ab", "c", "d"]);
            this.assertTrue("a".match(re) == null);
            this.assertTrue("ab".match(re).length > 0);
            this.assertTrue("eec".match(re).length > 0);
            this.assertTrue("dee\\".match(re).length > 0);

            re = this.hm.__buildRegExpFromArray(["\\ab", "^", "$$"]);
            this.assertTrue("\\a".match(re) == null);
            this.assertTrue("\\abhhhh".match(re).length > 0);
            this.assertTrue("ee^".match(re).length > 0);
            this.assertTrue("d$$\\".match(re).length > 0);

            re = this.hm.__buildRegExpFromArray(["...", "^*", "+$"]);
            this.assertTrue("^".match(re) == null);
            this.assertTrue("$".match(re) == null);
            this.assertTrue("..".match(re) == null);
            this.assertTrue("...hgjks".match(re).length > 0);
            this.assertTrue("ee^*".match(re).length > 0);
            this.assertTrue("d$+$\\".match(re).length > 0);

            re = this.hm.__buildRegExpFromArray([".?.", "!*", "+="]);
            this.assertTrue("*".match(re) == null);
            this.assertTrue("=".match(re) == null);
            this.assertTrue("..".match(re) == null);
            this.assertTrue(".?.hgjks".match(re).length > 0);
            this.assertTrue("ee!*".match(re).length > 0);
            this.assertTrue("d$+=\\".match(re).length > 0);

            re = this.hm.__buildRegExpFromArray([".?:", "++/", "()"]);
            this.assertTrue("(".match(re) == null);
            this.assertTrue(":".match(re) == null);
            this.assertTrue("./".match(re) == null);
            this.assertTrue(".?:hgjks".match(re).length > 0);
            this.assertTrue("ee++/*".match(re).length > 0);
            this.assertTrue("d()=\\".match(re).length > 0);

            re = this.hm.__buildRegExpFromArray([".[]", "{+\\\\}", "(???)"]);
            this.assertTrue("(".match(re) == null);
            this.assertTrue(":".match(re) == null);
            this.assertTrue("./".match(re) == null);
            this.assertTrue(".?:{+\\\\}".match(re).length > 0);
            this.assertTrue("(???)e++/*".match(re).length > 0);
            this.assertTrue(".[]".match(re).length > 0);
        },

        testGetNonEncodedSeparators : function () {
            var sep = ["-", " g", "-pp", "_", "_dd", ".", ",", "&", "sd.", "!", "sss!", "?a", "~", "s~d", "*", "cd*",
                    "'", "'dd", "(", "ab(", ")", "de)", "--()", "!$$", "  hh"];
            var neSep = this.hm.__getNonEncodedSeparators(sep);
            this.assertJsonEquals(neSep, ["-", "-pp", "_", "_dd", ".", "sd.", "!", "sss!", "~", "s~d", "*", "cd*", "'",
                    "'dd", "(", "ab(", ")", "de)", "--()"]);
        },

        testSetSeparators : function () {

            // test for invalid characters
            var sepToTest = ["#", "%", "^", "[", "]", "{", "}", "\\", "\"", "<", ">", "="];

            for (var i = 0, len = sepToTest.length; i < len; i++) {
                this.hm.setSeparators(sepToTest[i]);
                this.assertErrorInLogs(this.hm.INVALID_SEPARATOR);
            }

            // test that the array format is accepted
            this.hm.setSeparators(["a", "b"]);
            this.assertJsonEquals(["a", "b"], this.hm._separators);
            this.assertJsonEquals(["a", "b"], this.hm._nonEncodableSeparators);
            this.assertJsonEquals("cbccacccbd".split(this.hm._separatorRegExp), ["c", "cc", "ccc", "d"]);
            this.assertJsonEquals("cbccacccbd".split(this.hm._nonEncodableSepRegExp), ["c", "cc", "ccc", "d"]);

            this.hm.setSeparators(["a", "\/"]);
            this.assertJsonEquals(["a", "\/"], this.hm._separators);
            this.assertJsonEquals(["a"], this.hm._nonEncodableSeparators);
            this.assertJsonEquals("c\/ccacccb".split(this.hm._separatorRegExp), ["c", "cc", "cccb"]);
            this.assertJsonEquals("c\/ccacccb".split(this.hm._nonEncodableSepRegExp), ["c\/cc", "cccb"]);

            this.hm.setSeparators([","]);
            this.hm.setHash("a=b,c=d");
            this.hm.setSeparators(["&"]);
            this.assertTrue(this.hm.getHashString() == "a=b&c=d");

        },

        testAddSeparators : function () {
            this.hm.setSeparators("&");
            this.hm.addSeparators("|");
            this.hm.setHash("a=b&c=d|e=f");

            this.assertJsonEquals(this.hm.getHashObject(), {
                a : "b",
                c : "d",
                e : "f"
            });
            this.hm.addSeparators("|");
            this.assertJsonEquals(this.hm._separators, ["&", "|"]);
            this.hm.setHash("");
        },

        testSetHash : function () {
            var window = Aria.$window;
            var hm = this.hm;
            hm.setHash(1);
            this.assertErrorInLogs(hm.INVALID_SETHASH_ARGUMENT);
            hm.setHash("#aa");
            this.assertTrue(window.location.hash == "#aa");

            hm.setHash("aa");
            this.assertTrue(window.location.hash == "#aa");

            hm.setSeparators(",");

            hm.setHash({
                a : "b",
                c : "d"
            });
            this.assertTrue(window.location.hash == "#a=b,c=d");

            hm.setHash({
                a : "b,b",
                c : "d"
            });
            this.assertTrue(hm.getHashString() == "a=b%2Cb,c=d");
            this.assertJsonEquals(hm.getHashObject(), {
                a : "b,b",
                c : "d"
            });
        },

        /**
         * Since we change the hash in setUp, the browser will raise a change event from whatever there was before to an
         * empty hash when JS yelds. For this reason we might get two events, wait a bit to start this test
         */
        testAsyncAddRemoveCallback : function () {
            aria.core.Timer.addCallback({
                fn : this.__startTestAsyncAddRemoveCallback,
                scope : this,
                delay : 2 * this.hm.ie7PollDelay
            });
        },

        __startTestAsyncAddRemoveCallback : function () {
            var hm = this.hm;

            hm.setSeparators(",");

            this.__cb1 = {
                fn : "__callback1",
                scope : this,
                args : {
                    myarg : "cb1"
                }
            };
            hm.addCallback(this.__cb1);
            this.__cb2 = {
                fn : this.__callback2,
                scope : this,
                args : {
                    myarg : "cb2"
                }
            };
            hm.addCallback(this.__cb2);
            this.__cb3 = {
                fn : this.__callback3,
                scope : this,
                args : {
                    myarg : "cb3"
                }
            };
            hm.addCallback(this.__cb3);

            this.assertTrue(hm._hashChangeCallbacks.length == 3);
            hm.setHash({
                a : "b",
                c : "d"
            });
            aria.core.Timer.addCallback({
                fn : this.__testAddRemoveCallbackCb1,
                scope : this,
                delay : 2 * hm.ie7PollDelay
            });
        },

        __testAddRemoveCallbackCb1 : function () {
            debugger;
            var hm = this.hm;
            this.assertTrue(this.__callbackCount["__callback1"] == 1);
            this.assertTrue(this.__callbackCount["__callback2"] == 1);
            this.assertTrue(this.__callbackCount["__callback3"] == 1);

            hm.removeCallback(this.__cb2);
            this.assertTrue(hm._hashChangeCallbacks.length == 2);

            hm.setHash({
                e : "b",
                c : "e"
            });
            aria.core.Timer.addCallback({
                fn : this.__testAddRemoveCallbackCb2,
                scope : this,
                delay : 2 * hm.ie7PollDelay
            });

        },

        __testAddRemoveCallbackCb2 : function () {
            var hm = this.hm;
            this.assertTrue(this.__callbackCount["__callback1"] == 2);
            this.assertTrue(this.__callbackCount["__callback2"] == 1);
            this.assertTrue(this.__callbackCount["__callback3"] == 2);

            hm.setIE7polling(false);

            hm.setHash({
                e : "b",
                d : "e"
            });
            aria.core.Timer.addCallback({
                fn : this.__testAddRemoveCallbackCb3,
                scope : this,
                delay : 2 * hm.ie7PollDelay
            });
        },

        __testAddRemoveCallbackCb3 : function () {
            var hm = this.hm;

            if (aria.core.Browser.isIE7) {
                this.assertTrue(this.__callbackCount["__callback1"] == 2);
                this.assertTrue(this.__callbackCount["__callback2"] == 1);
                this.assertTrue(this.__callbackCount["__callback3"] == 2);
            } else {

                this.assertTrue(this.__callbackCount["__callback1"] == 3);
                this.assertTrue(this.__callbackCount["__callback2"] == 1);
                this.assertTrue(this.__callbackCount["__callback3"] == 3);
            }

            hm.setHash({
                e : "b",
                h : "e"
            });

            hm.setIE7polling(true);
            if (!aria.core.Browser.isIE7) {
                this.assertErrorInLogs(hm.INVALID_HASHPOLLING_TRIGGER);
            }

            aria.core.Timer.addCallback({
                fn : this.__testAddRemoveCallbackCb4,
                scope : this,
                delay : 2 * hm.ie7PollDelay
            });
        },

        __testAddRemoveCallbackCb4 : function () {
            var hm = this.hm;
            if (aria.core.Browser.isIE7) {
                this.assertTrue(this.__callbackCount["__callback1"] == 3);
                this.assertTrue(this.__callbackCount["__callback2"] == 1);
                this.assertTrue(this.__callbackCount["__callback3"] == 3);
            } else {

                this.assertTrue(this.__callbackCount["__callback1"] == 4);
                this.assertTrue(this.__callbackCount["__callback2"] == 1);
                this.assertTrue(this.__callbackCount["__callback3"] == 4);
            }

            hm.removeCallback(this.__cb1);
            hm.removeCallback(this.__cb3);
            this.assertTrue(hm._hashChangeCallbacks == null);

            delete this.__cb1;
            delete this.__cb2;
            delete this.__cb3;
            this.myNotifyTestEnd("testAsyncAddRemoveCallback");
        },

        __callback1 : function (hashObject, args) {
            this.assertJsonEquals(hashObject, this.hm.getHashObject());
            this.assertTrue(args.myarg == "cb1");
            this.__callbackCount["__callback1"] = (this.__callbackCount["__callback1"])
                    ? this.__callbackCount["__callback1"] + 1
                    : 1;
        },

        __callback2 : function (hashObject, args) {
            this.assertJsonEquals(hashObject, this.hm.getHashObject());
            this.assertTrue(args.myarg == "cb2");
            this.__callbackCount["__callback2"] = (this.__callbackCount["__callback2"])
                    ? this.__callbackCount["__callback2"] + 1
                    : 1;
        },

        __callback3 : function (hashObject, args) {
            this.assertJsonEquals(hashObject, this.hm.getHashObject());
            this.assertTrue(args.myarg == "cb3");
            this.__callbackCount["__callback3"] = (this.__callbackCount["__callback3"])
                    ? this.__callbackCount["__callback3"] + 1
                    : 1;
        }

    }
});