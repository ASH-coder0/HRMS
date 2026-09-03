import React, { useState } from "react";

const MessageSetting = () => {
  const [messageTemplate, setMessageTemplate] = useState("");

  const handleSave = () => {
    console.log("Saved Template:", messageTemplate);

    // TODO: Call API here
    // await api.post("/message-template", { messageTemplate });
  };

  return (
    <div className="max-w-3xl rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold">Message Template Settings</h2>
      <p className="mb-4 text-sm text-gray-500">
        Create and save a message template that can be reused when sending
        notifications to employees.
      </p>

      <div className="space-y-2">
        <label
          htmlFor="messageTemplate"
          className="block text-sm font-medium"
        >
          Message Template
        </label>

        <textarea
          id="messageTemplate"
          rows={4}
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          placeholder="Enter your message template here..."
          className="w-full rounded-md border p-3 outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-md bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
        >
          Save Template
        </button>
      </div>
    </div>
  );
};

export default MessageSetting;