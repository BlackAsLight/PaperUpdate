import * as fs from 'fs';
import * as https from 'https';

(async () => {
	let args = process.argv;
	args.shift();
	args.shift();
	const projects: string[] = JSON.parse(await getRequest('https://papermc.io/api/v2/projects')).projects;
	console.log(`\nAvailable project types to download are: ${projects.join(' | ')}\n`);
	if (args.length) {
		while (args.length) {
			const type = args.shift().toLowerCase();
			if (type.startsWith('-')) {
				let project: string;
				for (let i = 0; i < projects.length; ++i)
					if (type == `-${projects[i]}`) {
						project = projects[i];
						break;
					}
				if (project == null) {
					// Error. Invalid Project!
					console.log(`${type.slice(1)} is an invalid project type!\nSkipping ${args.shift()}\n`);
					continue;
				}
				const path = (() => {
					const arg = args.shift();
					if (arg.endsWith('/'))
						return arg;
					return arg + '/';
				})();
				console.log(`Path: ${path}`);
				const currentVersion = JSON.parse(fs.readFileSync(path + 'version_history.json').toString()).currentVersion;
				const currentBuild = parseInt(currentVersion.split(' ')[0].split('-')[2]);
				console.log(`Current Build: ${currentBuild}`);
				const versionGroup = currentVersion.split(' ')[2].slice(0, -1).split('.').slice(0, 2).join('.');
				console.log(`Version Group: ${versionGroup}`);
				const timeLimit = new Date().getTime() - 1000 * 60 * 60 * 24;
				const build = await (async () => {
					console.log('Looking up available builds...');
					let builds = JSON.parse(await getRequest(`https://papermc.io/api/v2/projects/${project}/version_group/${versionGroup}/builds/`)).builds.filter(x => new Date(x.time).getTime() < timeLimit);
					let result = builds.shift();
					while (builds.length) {
						const build = builds.shift();
						if (build.build > result.build)
							result = build;
					}
					return result;
				})();
				console.log(`Latest Available Build: ${build.build}`);
				if (build.build <= currentBuild) {
					console.log(`Latest Build is already downloaded. Skipping ${path}\n`);
					continue;
				}
				console.log(`${build.downloads.application.name} is Downloading...`);
				await new Promise((resolve) => https.get(`https://papermc.io/api/v2/projects/${project}/versions/${build.version}/builds/${build.build}/downloads/${build.downloads.application.name}`, (res) => {
					const file = fs.createWriteStream(path + build.downloads.application.name);
					res.pipe(file);
					file.on('finish', () => {
						file.close();
						console.log(`Downloaded ${build.downloads.application.name} for ${path}`);
						fs.renameSync(path + build.downloads.application.name, path + project + '.jar');
						console.log(`Replaced ${project}.jar with ${build.downloads.application.name}`);
						resolve(true);
					});
				}));
			}
			else {
				// Error. Project Type not Provided!
				console.log(`This is not a valid project type to download: ${type.slice(1)}`);
			}
			console.log('\n');
		}
		console.log('Done\n');
	}
	else {
		// No Args Provided!
		console.log('No arguments were provided. Please do `node main.js <project> <path>`\n');
	}
})();

async function getRequest(url: string) {
	return await new Promise<string>((resolve, reject) => https.get(url, (res) => {
		let text = '';
		res.on('data', (data) => text += data);
		res.on('end', () => resolve(text));
		res.on('error', (error) => reject(error));
	}));
}