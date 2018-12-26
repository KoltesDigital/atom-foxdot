const { spawn } = require('child_process');
const gulp = require('gulp');

gulp.task('generate-autocomplete', () => {
	return new Promise((resolve, reject) => {
		const pythonPath = process.env.PYTHONPATH || 'python';
		const childProcess = spawn(pythonPath, ['tasks/generate-autocomplete.py']);

		childProcess.on('close', (code) => {
			if (code) {
				return reject(`python process exited with code ${code}`);
			}

			return resolve();
		});
	});
});
