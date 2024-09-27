const fs = require("fs");
const axios = require("axios");

const users = JSON.parse(fs.readFileSync("user.json", "utf8"));
const iframes = JSON.parse(fs.readFileSync("iframe.json", "utf8"));

const getHeader = async (user) => {
  return {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    authorization: `tma ${user.replace(/(\r\n|\n|\r)/gm, "")}`,
    "content-type": "application/json",
    origin: "https://cats-frontend.tgapps.store",
    priority: "u=1, i",
    referer: "https://cats-frontend.tgapps.store/",
    "sec-ch-ua":
      '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  };
};

const getTasks = async (user) => {
  const header = await getHeader(user);
  console.log({headers: header})
  try {
    const response = await axios.get(
      "https://api.catshouse.club/tasks/user?group=cats",
      { headers: header, timeout: 10000 }
    );
    console.log("tasks", response.data.tasks);
    const not_completed_tasks = response.data.tasks.filter(
      (task) => !task.completed
    );
    return not_completed_tasks;
  } catch (e) {
    console.log(e);
  }
};

const getTasksBitget = async (user) => {
  const header = await getHeader(user);
  try {
    const response = await axios.get(
      `https://api.catshouse.club/tasks/user?group=bitget`,
      { headers: header }
    );
    console.log("tasksBitget", response.data.tasks);
    return response.data.tasks;
  } catch (e) {
    console.log(e);
  }
};

const completeTask = async (user, task) => {
  const header = await getHeader(user);
  try {
    const response = await axios.post(
      `https://api.catshouse.club/tasks/${task?.id}/complete`,
      {},
      { headers: header }
    );
    if (response.data.success) {
      console.log(`Đã hoàn thành task ${task?.id} là ${task?.title}`);
    } else {
      console.log(`"Không thể hoàn thành task ${task?.id} là ${task?.title} `);
    }
  } catch (e) {
    console.log(`"Không thể hoàn thành task ${task.id} là ${task.title} `);
  }
};
async function main() {
  console.log("Start");
  try {
    for (const iframe of iframes) {
      const web_app_data = Object.fromEntries(
        new URLSearchParams(iframe.replace(/.*tgWebAppData/, "tgWebAppData"))
      );
      const user = web_app_data.tgWebAppData;
      let tasks = [];
      console.log({ user });
      const normalTasks = await getTasks(user);
      const tasksBitget = await getTasksBitget(user);
      console.log("normalTasks", normalTasks);
      console.log("tasksBitget", tasksBitget);
      tasks = tasks.concat(normalTasks, tasksBitget);
      for (let j = 0; j < tasks.length; j++) {
        const task = tasks[j];
        await completeTask(user, task);
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
main();
