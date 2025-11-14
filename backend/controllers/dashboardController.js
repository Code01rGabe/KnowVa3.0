const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Classroom = require('../models/Classroom');

// Teacher overview stats
const getTeacherStats = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const courses = await Course.find({ teacherId })
      .select('_id title enrolledStudents createdAt')
      .sort({ createdAt: -1 });

    const courseCount = courses.length;
    let totalEnrolled = 0;
    const uniqueStudentIds = new Set();

    courses.forEach((course) => {
      const count = course.enrolledStudents?.length || 0;
      totalEnrolled += count;
      course.enrolledStudents?.forEach((studentId) =>
        uniqueStudentIds.add(studentId.toString())
      );
    });

    const assignments = await Assignment.find({ teacherId })
      .select('_id title dueDate courseId createdAt')
      .sort({ createdAt: -1 });

    const assignmentIds = assignments.map((assignment) => assignment._id);
    let averageGrade = null;
    let pendingSubmissions = 0;

    if (assignmentIds.length) {
      const [pendingCount, gradedSubmissions] = await Promise.all([
        Submission.countDocuments({
          assignmentId: { $in: assignmentIds },
          status: 'pending',
        }),
        Submission.find({
          assignmentId: { $in: assignmentIds },
          grade: { $ne: null },
        }).select('grade'),
      ]);

      pendingSubmissions = pendingCount;
      if (gradedSubmissions.length) {
        const totalGrade = gradedSubmissions.reduce(
          (sum, submission) => sum + submission.grade,
          0
        );
        averageGrade = Number(
          (totalGrade / gradedSubmissions.length).toFixed(1)
        );
      }
    }

    const averageStudentsPerCourse = courseCount
      ? Number((totalEnrolled / courseCount).toFixed(1))
      : 0;

    // Get classrooms for this teacher
    const classrooms = req.user.schoolId
      ? await Classroom.find({
          schoolId: req.user.schoolId,
          teachers: teacherId,
        })
          .populate('students', 'profile.name email')
          .select('name description level students createdAt')
          .sort({ createdAt: -1 })
      : [];

    const recentCourses = courses.slice(0, 4).map((course) => ({
      id: course._id,
      title: course.title,
      students: course.enrolledStudents?.length || 0,
      createdAt: course.createdAt,
    }));

    const upcomingAssignments = assignments
      .filter((assignment) => new Date(assignment.dueDate) > new Date())
      .slice(0, 4)
      .map((assignment) => ({
        id: assignment._id,
        title: assignment.title,
        dueDate: assignment.dueDate,
        courseId: assignment.courseId,
      }));

    res.json({
      metrics: {
        courseCount,
        studentCount: uniqueStudentIds.size,
        averageStudentsPerCourse,
        averageGrade,
        pendingSubmissions,
        classroomCount: classrooms.length,
      },
      recentCourses,
      upcomingAssignments,
      classrooms: classrooms.map((classroom) => ({
        id: classroom._id,
        name: classroom.name,
        description: classroom.description,
        level: classroom.level,
        studentCount: classroom.students?.length || 0,
        createdAt: classroom.createdAt,
      })),
    });
  } catch (error) {
    console.error('Teacher dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Student overview stats
const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const courses = await Course.find({ enrolledStudents: studentId })
      .select('_id title teacherId createdAt')
      .populate('teacherId', 'profile.name email')
      .sort({ createdAt: -1 });

    const courseCount = courses.length;
    const courseIds = courses.map((course) => course._id);

    const submissions = await Submission.find({ studentId })
      .populate('assignmentId', 'title dueDate courseId')
      .sort({ updatedAt: -1 });

    const gradedSubmissions = submissions.filter(
      (submission) => submission.grade !== null && submission.grade !== undefined
    );

    const averageGrade = gradedSubmissions.length
      ? Number(
          (
            gradedSubmissions.reduce(
              (sum, submission) => sum + submission.grade,
              0
            ) / gradedSubmissions.length
          ).toFixed(1)
        )
      : null;

    const assignments = courseIds.length
      ? await Assignment.find({ courseId: { $in: courseIds } })
          .select('_id title dueDate courseId')
          .populate('courseId', 'title')
          .sort({ dueDate: 1 })
      : [];

    const submissionsMap = new Map();
    submissions.forEach((submission) => {
      const id =
        submission.assignmentId?._id?.toString() ||
        submission.assignmentId?.toString();
      if (id) {
        submissionsMap.set(id, submission);
      }
    });

    const now = new Date();
    let pendingAssignments = 0;
    const upcomingAssignments = [];

    assignments.forEach((assignment) => {
      const assignmentId = assignment._id.toString();
      const submission = submissionsMap.get(assignmentId);
      const dueDate = new Date(assignment.dueDate);
      const isCompleted = submission && submission.status === 'graded';

      if (dueDate >= now && (!submission || submission.status !== 'graded')) {
        pendingAssignments += 1;
        if (upcomingAssignments.length < 4) {
          upcomingAssignments.push({
            id: assignment._id,
            title: assignment.title,
            dueDate: assignment.dueDate,
            courseTitle: assignment.courseId?.title || 'Course',
            status: submission ? submission.status : 'not-started',
          });
        }
      }
    });

    const recentGrades = gradedSubmissions.slice(0, 5).map((submission) => ({
      id: submission._id,
      title: submission.assignmentId?.title || 'Assignment',
      grade: submission.grade,
      updatedAt: submission.updatedAt,
    }));

    // Get classrooms for this student
    const classrooms = req.user.schoolId
      ? await Classroom.find({
          schoolId: req.user.schoolId,
          students: studentId,
        })
          .populate('teachers', 'profile.name email')
          .select('name description level teachers createdAt')
          .sort({ createdAt: -1 })
      : [];

    res.json({
      metrics: {
        courseCount,
        averageGrade,
        completedAssignments: gradedSubmissions.length,
        pendingAssignments,
        totalSubmissions: submissions.length,
        classroomCount: classrooms.length,
      },
      upcomingAssignments,
      recentGrades,
      courses: courses.slice(0, 4),
      classrooms: classrooms.map((classroom) => ({
        id: classroom._id,
        name: classroom.name,
        description: classroom.description,
        level: classroom.level,
        teacherCount: classroom.teachers?.length || 0,
        createdAt: classroom.createdAt,
      })),
    });
  } catch (error) {
    console.error('Student dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTeacherStats,
  getStudentStats,
};

