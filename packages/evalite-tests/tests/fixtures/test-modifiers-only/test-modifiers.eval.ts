import { evalite } from "evalite";

evalite.only("Only Test 1", {
  data: () => {
    console.log("opts.data() called in Only Test 1");
    return [{ input: "only1", expected: "only1" }];
  },
  task: function getTask(input: string) {
    return input;
  },
  scorers: [],
});

evalite.only("Only Test 2", {
  data: () => {
    console.log("opts.data() called in Only Test 2");
    return [{ input: "only2", expected: "only2" }];
  },
  task: function getTask(input: string) {
    return input;
  },
  scorers: [],
});

evalite.only("Only Test 3", {
  data: () => {
    console.log("opts.data() called in Only Test 3");
    return [{ input: "only3", expected: "only3" }];
  },
  task: function getTask(input: string) {
    return input;
  },
  scorers: [],
});

evalite("Non Only Test", {
  data: () => {
    console.log("opts.data() called in Non Only Test");
    return [{ input: "nonOnly", expected: "nonOnly" }];
  },
  task: function getTask(input: string) {
    return input;
  },
  scorers: [],
}); 
